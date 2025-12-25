using Bank.Application.DTOs;
using Bank.Application.Services;
using Bank.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Bank.API.Controllers;
[ApiController]
[Route("api/customer")]
public class CustomerController : ControllerBase
{
    private readonly BankService _service;

    public CustomerController(BankService service)
    {
        _service = service;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(CreateCustomerAccountDto dto)
    {
        var customer = await _service.CreateAccountAsync(dto);
        
        var responseDto = new BankerCustomerDto {
            Id = customer.Id,
            FullName = customer.FullName,
            PhoneNumber = customer.PhoneNumber,
            Balance = customer.Account.Balance,
            CreatedAt = DateTime.UtcNow // Placeholder
        };

        return Ok(responseDto);
    }

    [HttpPost("deposit/{accountId}")]
    public async Task<IActionResult> Deposit(int accountId, TransactionDto dto)
    {
        await _service.DepositAsync(accountId, dto.Amount);
        return Ok("Deposit successful");
    }

    [HttpPost("withdraw/{accountId}")]
    public async Task<IActionResult> Withdraw(int accountId, TransactionDto dto)
    {
        await _service.WithdrawAsync(accountId, dto.Amount);
        return Ok("Withdraw successful");
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var customer = await _service.GetCustomerByPhoneAsync(loginDto.PhoneNumber);
        if (customer == null)
            return NotFound("Customer not found");
            
        return Ok(customer);
    }
}

public class LoginDto { public string PhoneNumber { get; set; } }
