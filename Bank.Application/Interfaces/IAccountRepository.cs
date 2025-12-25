using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Bank.Domain.Entities;

namespace Bank.Application.Interfaces;

public interface IAccountRepository
{
   // Task<List<Account>> GetAllAsync();
    Task<Account?> GetByIdAsync(int id);
   // Task AddAsync(Account account);
    Task UpdateAsync(Account account);
    Task DeleteAsync(Account account); 
}