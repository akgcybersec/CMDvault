# Docker Deployment

This application can be easily deployed using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CMDvault
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Default login: `admin` / `admin`

## Configuration

### Database Persistence
The SQLite database is persisted in a Docker volume at `./data`. The database will be automatically created on first run.

### Environment Variables
You can customize the deployment by modifying the `docker-compose.yml` file:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
```

### Port Configuration
To change the exposed port, modify the `ports` section in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Access on port 8080 instead of 3000
```

## Commands

### Start the application
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop the application
```bash
docker-compose down
```

### Rebuild the image
```bash
docker-compose build --no-cache
```

### Backup the database
```bash
docker cp $(docker-compose ps -q app):/app/data/database.db ./backup-$(date +%Y%m%d).db
```

### Restore the database
```bash
docker cp ./backup-20231201.db $(docker-compose ps -q app):/app/data/database.db
docker-compose restart app
```

## Production Considerations

1. **Change default credentials**: After first login, change the admin password immediately
2. **Use HTTPS**: Set up a reverse proxy (nginx, traefik) for SSL termination
3. **Regular backups**: Implement automated database backups
4. **Resource limits**: Consider adding memory and CPU limits in docker-compose.yml

## Troubleshooting

### Permission Issues
If you encounter permission errors with the database:
```bash
sudo chown -R 1001:1001 ./data
```

### Port Conflicts
If port 3000 is already in use, change the port mapping in docker-compose.yml

### Database Issues
If the database becomes corrupted:
1. Stop the container: `docker-compose down`
2. Remove the data directory: `rm -rf ./data`
3. Restart: `docker-compose up -d`
