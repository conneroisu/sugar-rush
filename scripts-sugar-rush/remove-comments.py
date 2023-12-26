#!usr/bin/python3

if __name__ == '__main__':
    import sys
    import re

    if len(sys.argv) < 2:
        print('Usage: remove-comments.py <file>')
        sys.exit(1)

    with open(sys.argv[1], 'r') as f:
        content = f.read()

    content = re.sub(r'(?m)^#.*\n?', '', content)

    with open(sys.argv[1], 'w') as f:
        f.write(content)
