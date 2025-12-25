namespace Bank.Application.DTOs;

public class TransferDto
{
    public int FromAccountId { get; set; }
    public int ToAccountId { get; set; }
    public string ToPhoneNumber { get; set; }
    public decimal Amount { get; set; }
}
