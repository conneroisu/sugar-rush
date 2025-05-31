{
  description = "Protobuf Compiler/Codegen Declaratively from Nix";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs = inputs: let
    eachSystem = f:
      builtins.listToAttrs (
        map
        (system: {
          name = system;
          value = f system;
        })
        [
          "x86_64-linux"
          "aarch64-linux"
          "x86_64-darwin"
          "aarch64-darwin"
        ]
      );

    # Evaluate the treefmt modules with an inline treefmt config
    treefmtEval = eachSystem (
      system: let
        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [];
        };
      in
        inputs.treefmt-nix.lib.evalModule pkgs {
          projectRootFile = "flake.nix";

          # Format Nix files with alejandra
          programs = {
            alejandra.enable = true;

            # Format Markdown, TypeScript, and JSON files with prettier
            buf.enable = true;
            prettier.enable = true;
            prettier.includes = [
              "**/*.md"
              "**/*.mdx"
              "**/*.ts"
              "**/*.tsx"
              "**/*.json"
            ];

            # Format YAML files
            yamlfmt.enable = true;
          };
        }
    );
  in {
    # Flake formatter output for `nix fmt`
    formatter = eachSystem (
      system:
        treefmtEval.${system}.config.build.wrapper
    );

    # Add checks
    checks = eachSystem (system: {
      # formatting = treefmtEval.${system}.config.build.check inputs.self;
    });

    devShells = eachSystem (
      system: let
        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [];
        };
        scripts = {
          dx = {
            exec = ''$EDITOR "$(git rev-parse --show-toplevel)"/flake.nix'';
            description = "Edit flake.nix";
          };
          lint = {
            exec = ''
              REPO_ROOT="$(git rev-parse --show-toplevel)"
              statix check "$REPO_ROOT"/flake.nix
              deadnix "$REPO_ROOT"/flake.nix
            '';
            deps = with pkgs; [statix deadnix];
            description = "Lint nix files";
          };
          version-bump = {
            type = "node";
            exec = ''
              import { readFileSync, writeFileSync } from "fs";

              try {
                  // Read and parse package.json
                  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
                  const currentVersion = packageJson.version;

                  if (!currentVersion) {
                      throw new Error("No version field found in package.json");
                  }

                  console.log("Current version:", currentVersion);

                  // Parse version components
                  const versionParts = currentVersion.split(".");
                  if (versionParts.length !== 3) {
                      throw new Error("Invalid version format: " + currentVersion + ". Expected format: major.minor.patch");
                  }

                  const [major, minor, patch] = versionParts.map(part => {
                      const num = Number(part);
                      if (isNaN(num) || num < 0) {
                          throw new Error("Invalid version number: " + part);
                      }
                      return num;
                  });

                  console.log("Major:", major, "Minor:", minor, "Patch:", patch);

                  // Increment patch version
                  const newPatch = patch + 1;

                  // Combine major, minor, and patch into a new version string with "." separators
                  const newVersion = major + "." + minor + "." + newPatch;
                  console.log("New version:", newVersion);

                  // Save it back to package.json
                  packageJson.version = newVersion;
                  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
                  console.log("Updated package.json with new version");

                  // Read minAppVersion from manifest.json and bump version to target version
                  let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
                  const { minAppVersion } = manifest;

                  if (!minAppVersion) {
                      throw new Error("No minAppVersion found in manifest.json");
                  }

                  manifest.version = newVersion;
                  writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));
                  console.log("Updated manifest.json with new version");

                  // Update versions.json with target version and minAppVersion from manifest.json
                  let versions = JSON.parse(readFileSync("versions.json", "utf8"));
                  versions[newVersion] = minAppVersion;
                  writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
                  console.log("Updated versions.json with new version");

                  console.log("\nSuccessfully bumped version from " + currentVersion + " to " + newVersion);

              } catch (error) {
                  console.error("Error:", error.message);
                  process.exit(1);
              }
            '';
          };
        };
        scriptPackages =
          pkgs.lib.mapAttrs
          (
            name: script: let
              scriptType = script.type or "app";
            in
              if scriptType == "node"
              then
                pkgs.writeShellApplication {
                  inherit name;
                  text = ''
                    ${pkgs.nodejs}/bin/node -e '${script.exec}'
                  '';
                  runtimeInputs = [pkgs.nodejs];
                }
              else
                pkgs.writeShellApplication {
                  inherit name;
                  text = script.exec;
                  runtimeInputs = script.deps or [];
                }
          )
          scripts;
      in {
        default = pkgs.mkShell {
          shellHook = ''
            export REPO_ROOT=$(git rev-parse --show-toplevel)
          '';
          packages = with pkgs;
            [
              # Nix
              alejandra
              nixd
              statix
              nixdoc
              # Add the formatter to the devShell
              treefmtEval.${system}.config.build.wrapper
              nodejs
              nodePackages.typescript
              nodePackages.nodemon
              nodePackages.ts-node
              nodePackages.eslint
              nodePackages.prettier
            ]
            ++ builtins.attrValues scriptPackages;
        };
      }
    );

    lib = {
      mkBufrnixPackage = {
        pkgs,
        self ? null,
        config ? {},
        ...
      }:
        import "${inputs.self}/src/lib/mkBufrnix.nix" {
          inherit pkgs self config;
        };
    };
  };
}
