using System;
using Bank.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bank.Infrastructure.Data;

public class BankDbContext:DbContext
{
    public BankDbContext(DbContextOptions<BankDbContext> options)
        : base(options){}
 public DbSet<Customer> Customers{get; set;}
 public DbSet<Account> Accounts{get; set;}
 public DbSet<Transaction> Transactions{get; set;}
}
