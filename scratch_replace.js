import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const files = [
  'app/api/projects/[id]/route.ts',
  'app/api/projects/route.ts',
  'app/api/services/[id]/route.ts',
  'app/api/services/route.ts',
  'app/api/profile/route.ts',
  'app/api/about/[id]/skill/[skillId]/route.ts',
  'app/api/about/[id]/route.ts',
  'app/api/about/route.ts'
];

const basePath = 'c:\\Z_Pratik\\Technology\\Portfolio\\MERN\\next_portfolio';

const searchRegex = /const\s+\{\s*userId\s*\}\s*=\s*await\s+auth\(\);\s*if\s*\(!userId\)\s*\{\s*return\s+NextResponse\.json\(\s*\{\s*message:\s*"Unauthorized:\s*Invalid\s+Clerk\s+session"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*\);\s*\}/g;

const replacement = `const { userId } = await auth();
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { message: "Forbidden: You are not authorized to perform this action" },
        { status: 403 }
      );
    }`;

files.forEach(file => {
  const filePath = join(basePath, file);
  if (!existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  let content = readFileSync(filePath, 'utf8');
  
  if (!content.includes('import { isAdmin }')) {
      const importAuth = 'import { auth } from "@clerk/nextjs/server";\nimport { isAdmin } from "@/lib/auth";';
      content = content.replace('import { auth } from "@clerk/nextjs/server";', importAuth);
  }

  content = content.replace(searchRegex, replacement);

  writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
});
