import os
import re

domain_dir = r"c:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/backend/src/main/java/com/artisanataschi/backend/domain"

for filename in os.listdir(domain_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(domain_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already refactored
        if "@Data" in content:
            continue
            
        classname = filename[:-5]
        
        # Add imports
        if "import lombok." not in content:
            content = content.replace("public class", "import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n@Data\n@NoArgsConstructor\n@AllArgsConstructor\npublic class", 1)
        
        # Remove constructors and getters/setters
        # We look for the first occurrence of `public ClassName() {`
        # and delete everything from there to the last `}`
        match = re.search(r'^\s*public\s+' + classname + r'\s*\(\)\s*\{', content, re.MULTILINE)
        if match:
            start_index = match.start()
            # Find the last closing brace
            last_brace_index = content.rfind('}')
            if last_brace_index > start_index:
                content = content[:start_index] + "}\n"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done refactoring domain classes.")
