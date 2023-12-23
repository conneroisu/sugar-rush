# Sugar Rush

<a name="readme-top"></a>
[![contributors](https://img.shields.io/github/contributors/conneroisu/sugar-rush.svg?style=for-the-badge)](https://github.com/conneroisu/sugar-rush/graphs/contributors)[![forks](https://img.shields.io/github/forks/conneroisu/sugar-rush.svg?style=for-the-badge)](https://github.com/conneroisu/sugar-rush/network/members)[![stargazers](https://img.shields.io/github/stars/conneroisu/sugar-rush.svg?style=for-the-badge)](https://github.com/conneroisu/sugar-rush/stargazers)[![license](https://img.shields.io/github/license/conneroisu/sugar-rush.svg?style=for-the-badge)](https://github.com/conneroisu/sugar-rush/blob/master/LICENSE)[![issues](https://img.shields.io/github/issues/conneroisu/sugar-rush.svg?style=for-the-badge)](https://github.com/conneroisu/sugar/issues)

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22sugar-rush%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
[![Tests](https://github.com/conneroisu/sugar-rush/actions/workflows/test-push-brach.yml/badge.svg)](https://github.com/conneroisu/sugar-rush/actions/workflows/test-push-brach.yml)
[![CodeQL](https://github.com/conneroisu/sugar-rush/actions/workflows/codeql.yml/badge.svg)](https://github.com/conneroisu/sugar-rush/actions/workflows/codeql.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/conneroisu/sugar-rush/badge)](https://www.codefactor.io/repository/github/conneroisu/sugar-rush)

<div align="center"> <img src="logo.jpeg" alt="Logo" width="80" height="80"> <h3 align="center">Sugar-Rush</h3> <p align="center"> A <a href="https://github.com/tpope/vim-vinegar">vim-vinegar</a> or <a href="https://github.com/stevearc/oil.nvim">oil</a> like file explorer that lets you edit your filesystem like a normal note/buffer in Obsidian. </p> </div>

<details>
<summary>Table of Contents</summary>
<ol>
    <li><a href="#Introduction">Introduction</a></li>
    <li><a href="#Warning-Of-Use">Warning-Of-Use</a></li>
    <li><a href="#use-cases">Use Cases</a> </li>
    <li><a href="#commands">Commands</a></li>
    <li><a href="#contribution">Contribution</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
</ol>
</details>

## Introduction

The goals of this plugin are to provide full control over the file system within your vault using a note as an interaction surface. 
Notes created with this plugin are hidden from searches within your vault to allow for a faultless adoption.

One can read more by going to the [wiki](https://github.com/conneroisu/sugar-rush/wiki)

## Details

### Leader Commands?

Wanting to use a leader key to trigger commands for the plugin? I recommend [tgrosinger's leader-hotkeys-obsidian](https://github.com/tgrosinger/leader-hotkeys-obsidian).
One can check out the guide to do this in terms of this repository [here]()


### Increment Map


Wanting to use `g<C-a>`? I would recommend using an [specific increment map]() within your `.obsidian.vimrc`


## Features

-   [ ] Edit your filesystem like a buffer (allows for creating, renaming, deleting, and moving)
-   [ ] Renaming of files hooks into actions inside of Obsidian so that plugins can readjust the links to and from a file.
-   [ ] Cross-Directory Actions

## Developing

### Core Plugin Development

Looking to develop **sugar-rush** further? Checkout [Developing](https://github.com/conneroisu/sugar-rush/wiki/Development)

### Expansive Plugin Development

Looking to develop **sugar-rush** to do something out of the project's scope of interacting with just the file system? Check out how you can expand this plugin with your own plugins here.


## Contributors

- Conner Ohnesorge [funding](https://ko-fi.com/connero)



