namespace Bank.Application.DTOs
{
    public class TransactionStatsDto
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
