using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Bank.Infrastructure.Data
{
    public class BankDbContextFactory : IDesignTimeDbContextFactory<BankDbContext>
    {
        public BankDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<BankDbContext>();

            // For design time, we can reach back to the API project's appsettings.json
            // or just use a default local connection string if preferred.
            // Let's try to be robust and find the API project's config.
            
            string path = Path.Combine(Directory.GetCurrentDirectory(), "..", "Bank.API");
            
            // If the current directory is not Infrastructure (e.g. running from root), adjust accordingly.
            if (!Directory.Exists(path))
            {
                 path = Path.Combine(Directory.GetCurrentDirectory(), "Bank.API");
            }

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(path)
                .AddJsonFile("appsettings.json")
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseSqlServer(connectionString);

            return new BankDbContext(optionsBuilder.Options);
        }
    }
}
