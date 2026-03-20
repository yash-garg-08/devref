import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Seed data ─────────────────────────────────────────────────────────────────
// Ships with generic placeholder commands so the app is immediately useful.
// Edit your cards directly in the UI — all changes persist to the database.
// Re-run `npm run db:seed` only if you want to reset to these defaults.
// ─────────────────────────────────────────────────────────────────────────────

const TABS: Array<{
  name: string
  slug: string
  order: number
  isBuiltIn: boolean
  cards: Array<{
    title: string
    code: string
    type?: string
    tag: string
    tagColor: string
    order: number
  }>
}> = [
  {
    name: 'SSH / SCP',
    slug: 'ssh-scp',
    order: 1,
    isBuiltIn: true,
    cards: [
      {
        title: 'SSH Connections',
        tag: 'ssh',
        tagColor: 'red',
        order: 0,
        code: `# Production server
ssh user@10.0.0.10

# Staging server
ssh user@10.0.0.20

# Dev / local VM
ssh user@192.168.1.100`,
      },
      {
        title: 'SCP — Local ↔ Server',
        tag: 'scp',
        tagColor: 'red',
        order: 1,
        code: `# Upload local directory to server
scp -r /path/to/local/ user@10.0.0.10:/remote/path/

# Download file from server
scp user@10.0.0.10:/remote/file.tar.gz ~/Downloads/

# Upload with identity file
scp -i ~/.ssh/id_rsa ./build.zip user@10.0.0.10:/var/www/`,
      },
    ],
  },
  {
    name: 'Object Storage',
    slug: 'storage',
    order: 2,
    isBuiltIn: true,
    cards: [
      {
        title: 'MinIO Client Setup',
        tag: 'mc',
        tagColor: 'blue',
        order: 0,
        code: `# Install mc
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# Verify
mc --version`,
      },
      {
        title: 'MC Aliases',
        tag: 'mc alias',
        tagColor: 'blue',
        order: 1,
        code: `# Add alias for your MinIO / S3-compatible endpoint
mc alias set mystore \\
  https://s3.example.com \\
  YOUR_ACCESS_KEY \\
  YOUR_SECRET_KEY

# List configured aliases
mc alias list`,
      },
      {
        title: 'MC Copy / Sync',
        tag: 'mc cp',
        tagColor: 'blue',
        order: 2,
        code: `# Upload a file to a bucket
mc cp ./myfile.tar.gz mystore/my-bucket/

# Download from bucket
mc cp mystore/my-bucket/myfile.tar.gz ./

# Mirror local directory to a bucket
mc mirror ./dist/ mystore/my-bucket/dist/`,
      },
    ],
  },
  {
    name: 'Kubernetes',
    slug: 'k8s',
    order: 3,
    isBuiltIn: true,
    cards: [
      {
        title: 'Cluster Context',
        tag: 'kubectl',
        tagColor: 'purple',
        order: 0,
        code: `# List available contexts
kubectl config get-contexts

# Switch context
kubectl config use-context my-cluster

# Get all namespaces
kubectl get ns`,
      },
      {
        title: 'Pods & Resources',
        tag: 'kubectl',
        tagColor: 'purple',
        order: 1,
        code: `# All resources in a namespace
kubectl get all -n my-namespace

# Describe a pod
kubectl describe pod my-pod -n my-namespace

# Stream logs
kubectl logs -f my-pod -n my-namespace

# Exec into a container
kubectl exec -it my-pod -n my-namespace -- /bin/sh`,
      },
      {
        title: 'Deployments',
        tag: 'kubectl',
        tagColor: 'purple',
        order: 2,
        code: `# Rollout status
kubectl rollout status deployment/my-app -n my-namespace

# Force restart
kubectl rollout restart deployment/my-app -n my-namespace

# Scale replicas
kubectl scale deployment/my-app --replicas=3 -n my-namespace`,
      },
    ],
  },
  {
    name: 'Docker',
    slug: 'docker',
    order: 4,
    isBuiltIn: true,
    cards: [
      {
        title: 'Build & Run',
        tag: 'docker',
        tagColor: 'blue',
        order: 0,
        code: `# Build image
docker build -t my-app:latest .

# Run container
docker run -d -p 8080:8080 --name my-app my-app:latest

# Run with env file
docker run --env-file .env -p 8080:8080 my-app:latest`,
      },
      {
        title: 'Manage Containers',
        tag: 'docker',
        tagColor: 'blue',
        order: 1,
        code: `# List running containers
docker ps

# Stop and remove
docker stop my-app && docker rm my-app

# Stream logs
docker logs -f my-app

# Exec into running container
docker exec -it my-app /bin/sh`,
      },
      {
        title: 'Cleanup',
        tag: 'docker',
        tagColor: 'blue',
        order: 2,
        code: `# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Full system prune (destructive)
docker system prune -af --volumes`,
      },
    ],
  },
  {
    name: 'Git',
    slug: 'git',
    order: 5,
    isBuiltIn: true,
    cards: [
      {
        title: 'Branch Management',
        tag: 'git',
        tagColor: 'orange',
        order: 0,
        code: `# Create and switch to a new branch
git checkout -b feature/my-feature

# Push and set upstream
git push -u origin feature/my-feature

# Delete local branch
git branch -d feature/my-feature

# Prune stale remote-tracking refs
git fetch --prune`,
      },
      {
        title: 'Undo & Reset',
        tag: 'git',
        tagColor: 'orange',
        order: 1,
        code: `# Unstage a file
git restore --staged path/to/file

# Discard working-tree changes
git restore path/to/file

# Amend last commit (keep message)
git commit --amend --no-edit

# Soft reset — keep changes staged
git reset --soft HEAD~1`,
      },
    ],
  },
  {
    name: 'Servers',
    slug: 'infra',
    order: 6,
    isBuiltIn: true,
    cards: [
      {
        title: 'Server IP Reference',
        tag: 'servers',
        tagColor: 'green',
        type: 'ip-table',
        order: 0,
        code: JSON.stringify([
          { id: '1', name: 'Production',  ip: '10.0.0.10' },
          { id: '2', name: 'Staging',     ip: '10.0.0.20' },
          { id: '3', name: 'Dev VM',      ip: '192.168.1.100' },
        ]),
      },
      {
        title: 'Nginx / Systemd',
        tag: 'nginx',
        tagColor: 'blue',
        order: 1,
        code: `# Test nginx config
nginx -t

# Reload (no downtime)
systemctl reload nginx

# Restart app server
sudo systemctl restart gunicorn

# View status
systemctl status nginx`,
      },
    ],
  },
  {
    name: 'Misc',
    slug: 'misc',
    order: 7,
    isBuiltIn: true,
    cards: [
      {
        title: 'Terraform',
        tag: 'terraform',
        tagColor: 'purple',
        order: 0,
        code: `# Init
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Debug
TF_LOG=DEBUG terraform apply`,
      },
      {
        title: 'Useful One-Liners',
        tag: 'util',
        tagColor: 'purple',
        order: 1,
        code: `# SHA-256 checksum
shasum -a 256 path/to/file.iso

# Find large files (>100MB)
find . -type f -size +100M | sort -rh | head -20

# Check what's listening on a port
lsof -i :8080

# Tail a log file
tail -fn 200 /var/log/app/error.log`,
      },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.card.deleteMany()
  await prisma.tab.deleteMany()

  for (const tabData of TABS) {
    const { cards, ...tabFields } = tabData

    const tab = await prisma.tab.create({
      data: {
        ...tabFields,
        cards: {
          create: cards.map(({ type: _type, ...cardFields }) => cardFields),
        },
      },
      include: { cards: true },
    })

    // Set card `type` via raw SQL — Prisma client predates this column
    for (const cardData of cards) {
      if (cardData.type && cardData.type !== 'code') {
        const dbCard = tab.cards.find((c) => c.title === cardData.title)
        if (dbCard) {
          await prisma.$executeRawUnsafe(
            `UPDATE Card SET type = ? WHERE id = ?`,
            cardData.type,
            dbCard.id,
          )
        }
      }
    }

    console.log(`  ✓ ${tab.name} (${cards.length} card${cards.length !== 1 ? 's' : ''})`)
  }

  console.log('\n✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
