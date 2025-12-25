using Bank.Application.Interfaces;
using Bank.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Bank.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IAccountRepository _accountRepo;

    public TransactionsController(
        ITransactionRepository transactionRepo,
        IAccountRepository accountRepo)
    {
        _transactionRepo = transactionRepo;
        _accountRepo = accountRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _transactionRepo.GetAllAsync();
        return Ok(transactions);
    }

    [HttpGet("account/{accountId}")]
    public async Task<IActionResult> GetByAccountId(int accountId)
    {
        var transactions = await _transactionRepo.GetByAccountIdAsync(accountId);
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var transaction = await _transactionRepo.GetByIdAsync(id);
        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }

    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit([FromBody] TransactionRequest request)
    {
        var account = await _accountRepo.GetByIdAsync(request.AccountId);
        if (account == null)
            return NotFound("Account not found");

        account.Balance += request.Amount;
        await _accountRepo.UpdateAsync(account); 

        var transaction = new Transaction
        {
            AccountId = request.AccountId,
            Amount = request.Amount,
            Type = "Deposit",
            Date = DateTime.UtcNow // 
        };

        await _transactionRepo.AddAsync(transaction); 

        return Ok(new { Message = "Deposit successful", Transaction = transaction });
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw([FromBody] TransactionRequest request)
    {
        var account = await _accountRepo.GetByIdAsync(request.AccountId);
        if (account == null)
            return NotFound("Account not found");

        if (account.Balance < request.Amount)
            return BadRequest("Insufficient funds");

        account.Balance -= request.Amount;
        await _accountRepo.UpdateAsync(account); 
        var transaction = new Transaction
        {
            AccountId = request.AccountId,
            Amount = request.Amount,
            Type = "Withdraw",
            Date = DateTime.UtcNow 
        };

        await _transactionRepo.AddAsync(transaction);

        return Ok(new { Message = "Withdrawal successful", Transaction = transaction });
    }
}

public class TransactionRequest
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
}