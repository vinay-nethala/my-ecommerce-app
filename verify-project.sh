#!/bin/bash
# Project Verification Script

echo "================================================"
echo "E-Commerce Application - Project Verification"
echo "================================================"
echo ""

# Check critical files
echo "✓ Checking critical files..."
critical_files=(
  "docker-compose.yml"
  "Dockerfile"
  "middleware.ts"
  ".env.example"
  "submission.json"
  "README.md"
  "package.json"
  "tsconfig.json"
)

missing=0
for file in "${critical_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (MISSING)"
    missing=$((missing+1))
  fi
done

echo ""
echo "✓ Checking directory structure..."
dirs=(
  "pages"
  "components"
  "prisma"
  "lib"
  "public"
)

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir/"
  else
    echo "  ✗ $dir/ (MISSING)"
    missing=$((missing+1))
  fi
done

echo ""
echo "✓ Checking pages structure..."
pages=(
  "pages/index.tsx"
  "pages/cart.tsx"
  "pages/products/[id].tsx"
  "pages/auth/signin.tsx"
  "pages/api/auth/[...nextauth].ts"
  "pages/api/cart/index.ts"
)

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    echo "  ✓ $page"
  else
    echo "  ✗ $page (MISSING)"
    missing=$((missing+1))
  fi
done

echo ""
echo "✓ Checking components..."
components=(
  "components/Navbar.tsx"
  "components/ProductCard.tsx"
)

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    echo "  ✓ $component"
  else
    echo "  ✗ $component (MISSING)"
    missing=$((missing+1))
  fi
done

echo ""
echo "✓ Checking Prisma setup..."
prisma_files=(
  "prisma/schema.prisma"
  "prisma/seed.ts"
  "prisma/migrations"
)

for file in "${prisma_files[@]}"; do
  if [ -e "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (MISSING)"
    missing=$((missing+1))
  fi
done

echo ""
echo "================================================"
if [ $missing -eq 0 ]; then
  echo "✓ ALL VERIFICATION CHECKS PASSED!"
  echo "================================================"
  echo ""
  echo "Project is ready to run:"
  echo "  docker-compose up"
  echo ""
  echo "Application will be available at:"
  echo "  http://localhost:3000"
  echo ""
  echo "Test credentials:"
  echo "  Email: test.user@example.com"
  echo "  Name: Test User"
  exit 0
else
  echo "✗ $missing verification checks FAILED"
  echo "================================================"
  exit 1
fi
