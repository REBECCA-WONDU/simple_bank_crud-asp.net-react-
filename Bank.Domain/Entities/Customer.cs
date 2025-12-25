using System;

namespace Bank.Domain.Entities;

public class Customer
{
  public int Id{get; set;}
  public string FullName {get; set;}=null!;
  public string? PhoneNumber{get; set;}=null!;
  public Account Account{get; set;}=null!; //one customer- one account 


// this line represents the r/ship b/n  the customer and account
// 1 customer can have many accounts
  //public ICollection<Account>Accounts {get; set;}=new List<Account>();
}
