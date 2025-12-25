// Bank.Application/DTOs/CreateCustomerAccountDto.cs
namespace Bank.Application.DTOs
{
    public class CreateCustomerAccountDto
    {
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }
}