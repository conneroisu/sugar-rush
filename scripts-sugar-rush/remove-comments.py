#!usr/bin/python3

if __name__ == '__main__':
    import sys
    import re

    if len(sys.argv) < 2:
        print('Usage: remove-js/ts-comments.py <file>')
        sys.exit(1)

    with open(sys.argv[1], 'r') as f:
        content = f.read()

        content = re.sub(r'//.*', '', content)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

    with open(sys.argv[1], 'w') as f:
        f.write(content)
