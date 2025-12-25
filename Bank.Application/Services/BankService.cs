using Bank.Application.DTOs;
using Bank.Application.Interfaces;
using Bank.Domain.Entities;

namespace Bank.Application.Services;

public class BankService
{
    private readonly ICustomerRepository _customerRepo;
    private readonly IAccountRepository _accountRepo;
    private readonly ITransactionRepository _transactionRepo;

    public BankService(
        ICustomerRepository customerRepo,
        IAccountRepository accountRepo,
        ITransactionRepository transactionRepo)
    {
        _customerRepo = customerRepo;
        _accountRepo = accountRepo;
        _transactionRepo = transactionRepo;
    }

    // CUSTOMER: Create account
    public async Task<Customer> CreateAccountAsync(CreateCustomerAccountDto dto)
    {
        var customer = new Customer
        {
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            Account = new Account
            {
                Balance = dto.Balance
            }
        };

        await _customerRepo.AddAsync(customer);
        return customer;
    }

    // CUSTOMER: Deposit
    public async Task DepositAsync(int accountId, decimal amount)
    {
        var account = await _accountRepo.GetByIdAsync(accountId)
            ?? throw new Exception("Account not found");

        account.Balance += amount;

        await _transactionRepo.AddAsync(new Transaction
        {
            AccountId = accountId,
            Amount = amount,
            Type = "Deposit"
        });

        await _accountRepo.UpdateAsync(account);
    }

    // CUSTOMER: Withdraw
    public async Task WithdrawAsync(int accountId, decimal amount)
    {
        var account = await _accountRepo.GetByIdAsync(accountId)
            ?? throw new Exception("Account not found");

        if (account.Balance < amount)
            throw new Exception("Insufficient balance");

        account.Balance -= amount;

        await _transactionRepo.AddAsync(new Transaction
        {
            AccountId = accountId,
            Amount = amount,
            Type = "Withdraw"
        });

        await _accountRepo.UpdateAsync(account);
    }

    // BANKER
    public async Task<List<BankerCustomerDto>> GetAllCustomersAsync()
    {
        var customers = await _customerRepo.GetAllAsync();
        
        return customers.Select(c => new BankerCustomerDto
        {
            Id = c.Id,
            FullName = c.FullName,
            PhoneNumber = c.PhoneNumber,
            Balance = c.Account?.Balance ?? 0,
            CreatedAt = DateTime.UtcNow // Placeholder as entity doesn't have it
        }).ToList();
    }

    public async Task UpdateCustomerAsync(int id, UpdateCustomerDto dto)
    {
        var customer = await _customerRepo.GetByIdAsync(id)
            ?? throw new Exception("Customer not found");

        customer.FullName = dto.FullName;
        customer.PhoneNumber = dto.PhoneNumber;

        await _customerRepo.UpdateAsync(customer);
    }

    public async Task DeleteCustomerAsync(int id)
    {
        var customer = await _customerRepo.GetByIdAsync(id)
            ?? throw new Exception("Customer not found");

        await _customerRepo.DeleteAsync(customer);
    }
    // Login Helper
    public async Task<BankerCustomerDto?> GetCustomerByPhoneAsync(string phoneNumber)
    {
        var customer = await _customerRepo.GetByPhoneNumberAsync(phoneNumber);
        if (customer == null) return null;

        return new BankerCustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            PhoneNumber = customer.PhoneNumber,
            Balance = customer.Account.Balance,
            CreatedAt = DateTime.UtcNow // Placeholder
        };
    }
}