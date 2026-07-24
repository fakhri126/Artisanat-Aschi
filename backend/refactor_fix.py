import os

domain_dir = r"c:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/backend/src/main/java/com/artisanataschi/backend/domain"

for filename in os.listdir(domain_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(domain_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # We need to extract the 3 lombok imports if they are in the wrong place
        # and move them to right after the package declaration
        
        new_lines = []
        imports_to_add = [
            "import lombok.Data;\n",
            "import lombok.NoArgsConstructor;\n",
            "import lombok.AllArgsConstructor;\n",
            "import org.hibernate.annotations.CreationTimestamp;\n",
            "import java.time.LocalDateTime;\n"
        ]
        
        package_line_idx = 0
        has_imports_added = False
        
        for i, line in enumerate(lines):
            if line.startswith("package "):
                package_line_idx = i
                
            # Filter out the misplaced imports
            if line.startswith("import lombok."):
                continue
            
            new_lines.append(line)
            
        # insert imports after package line
        # but first ensure no duplicates for LocalDateTime
        
        final_lines = []
        for i, line in enumerate(new_lines):
            final_lines.append(line)
            if i == package_line_idx:
                final_lines.append("\n")
                final_lines.extend(imports_to_add)
                
        # Now fix any duplicates for LocalDateTime
        unique_lines = []
        for line in final_lines:
            if line.strip() == "import java.time.LocalDateTime;" and unique_lines.count(line) > 0:
                continue
            unique_lines.append(line)

        # For Product.java, add createdAt
        if filename == "Product.java":
            # Add @CreationTimestamp before the last }
            for i in range(len(unique_lines)-1, -1, -1):
                if "}" in unique_lines[i]:
                    unique_lines.insert(i, "    @CreationTimestamp\n    private LocalDateTime createdAt;\n")
                    break

        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(unique_lines)

print("Done fixing.")
