// Bank.Application/DTOs/BankerCustomerDto.cs
namespace Bank.Application.DTOs
{
    public class BankerCustomerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}