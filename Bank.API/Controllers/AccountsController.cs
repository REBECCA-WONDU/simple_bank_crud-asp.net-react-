using Bank.Application.Interfaces;
using Bank.Application.DTOs;
using Bank.Application.Services;
using Bank.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Bank.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly IAccountRepository _accountRepo;
    private readonly ITransactionRepository _transactionRepo;
    private readonly BankService _bankService;

    public AccountsController(
        IAccountRepository accountRepo,
        ITransactionRepository transactionRepo,
        BankService bankService)
    {
        _accountRepo = accountRepo;
        _transactionRepo = transactionRepo;
        _bankService = bankService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null)
            return NotFound();

        return Ok(account);
    }

    [HttpPost("{id}/deposit")]
    public async Task<IActionResult> Deposit(int id, [FromBody] decimal amount)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null)
            return NotFound("Account not found");

        account.Balance += amount;
        await _accountRepo.UpdateAsync(account);

        var transaction = new Transaction
        {
            AccountId = id,
            Amount = amount,
            Type = "Deposit",
            Date = DateTime.UtcNow
        };

        await _transactionRepo.AddAsync(transaction);

        return Ok(new { Message = "Deposit successful", NewBalance = account.Balance });
    }

    [HttpPost("{id}/withdraw")]
    public async Task<IActionResult> Withdraw(int id, [FromBody] decimal amount)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account == null)
            return NotFound("Account not found");

        if (account.Balance < amount)
            return BadRequest("Insufficient funds");

        account.Balance -= amount;
        await _accountRepo.UpdateAsync(account);

        var transaction = new Transaction
        {
            AccountId = id,
            Amount = amount,
            Type = "Withdraw",
            Date = DateTime.UtcNow
        };

        await _transactionRepo.AddAsync(transaction);

        return Ok(new { Message = "Withdrawal successful", NewBalance = account.Balance });
    }

    [HttpGet("{id}/transactions")]
    public async Task<IActionResult> GetTransactions(int id)
    {
        var transactions = await _transactionRepo.GetByAccountIdAsync(id);
        return Ok(transactions);
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] TransferDto dto)
    {
        try 
        {
            await _bankService.TransferAsync(dto);
            return Ok("Transfer successful");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}