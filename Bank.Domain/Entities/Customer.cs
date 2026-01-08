using System;

namespace Bank.Domain.Entities;

public class Customer
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string? PhoneNumber { get; set; } = null!;
    public string Password { get; set; } = null!;
    public Account Account { get; set; } = null!; //one customer- one account 
}
