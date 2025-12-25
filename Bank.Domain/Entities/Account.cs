using System;
using System.Transactions;

namespace Bank.Domain.Entities;

public class Account
{
 public int Id { get; set; }
  public string? AccountNumber { get; set; }
  public decimal Balance { get; set; } = 0;
  public int CustomerId { get; set; }
  public Customer? Customer { get; set; } //is a navigation property that allows an account to access its owning customer object in code, representing a many-to-one relationship. or it means this account belongs to one customer.

public ICollection<Transaction> Transactions{get; set;}= new List<Transaction>(); 
} // this line states the r/ship b/n the account and transaction .. that 1 account can have many transactions
