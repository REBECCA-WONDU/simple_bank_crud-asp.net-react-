using Bank.Application.DTOs;
using Bank.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bank.API.Controllers
{
  [ApiController]
[Route("api/banker")]
public class BankerController : ControllerBase
{
    private readonly BankService _service;

    public BankerController(BankService service)
    {
        _service = service;
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllCustomersAsync());

    [HttpPut("customer/{id}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        var updatedCustomer = await _service.UpdateCustomerAsync(id, dto);
        return Ok(updatedCustomer);
    }

    [HttpDelete("customer/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteCustomerAsync(id);
        return Ok("Deleted");
    }

    [HttpPost("deposit/{id}")]
    public async Task<IActionResult> Deposit(int id, [FromBody] TransactionDto dto)
    {
        try 
        {
            await _service.DepositByCustomerIdAsync(id, dto.Amount);
            return Ok("Deposit successful");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("withdraw/{id}")]
    public async Task<IActionResult> Withdraw(int id, [FromBody] TransactionDto dto)
    {
        try 
        {
            await _service.WithdrawByCustomerIdAsync(id, dto.Amount);
            return Ok("Withdraw successful");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
}