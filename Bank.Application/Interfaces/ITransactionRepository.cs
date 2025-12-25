using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Bank.Domain.Entities;

namespace Bank.Application.Interfaces;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetAllAsync();
    Task<Transaction?> GetByIdAsync(int id);
     Task<List<Transaction>> GetByAccountIdAsync(int accountId);
    Task AddAsync(Transaction transaction);
    
}
