import re

fpath = r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/components/site/catalog-page.tsx"
with open(fpath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace git conflict blocks: <<<<<<< HEAD ... ======= ... >>>>>>> ... with HEAD content
pattern = re.compile(r'<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n.*?\r?\n>>>>>>> [a-f0-9]+\r?\n', re.DOTALL)
new_content, count = pattern.subn(r'\1\n', content)

print(f"Substituted {count} conflict blocks with HEAD content.")

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(new_content)

# Verify if any conflict markers remain
with open(fpath, 'r', encoding='utf-8') as f:
    remaining = [i+1 for i, l in enumerate(f) if l.startswith(('<<<<<<<', '=======', '>>>>>>>'))]

if remaining:
    print(f"WARNING: Remaining conflict markers on lines: {remaining}")
else:
    print("SUCCESS: Zero conflict markers remaining in catalog-page.tsx!")
