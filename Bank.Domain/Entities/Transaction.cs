using System;

namespace Bank.Domain.Entities;

public class Transaction
{
 public int Id{get; set;}
 public string? Type{get; set;}
 public decimal Amount{get; set;}
 public DateTime Date{get; set;}=DateTime.UtcNow;
 public int AccountId{get; set;}
 public Account? Account{get ; set;}// it means This transaction belongs to an account. AccountId:Stored in the database,Foreign key,Identifies which account this transaction belongs to.b) Account: Navigation property,Used in C# code,Lets you access account details easily
}

