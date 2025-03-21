
use anchor_lang::prelude::*;
declare_id!("2xHBV84Rd8yb3ytBgiZ1eFE4P9bavBuHFiwqyKvdkvTM");
#[program]
pub mod voting_program {
    use super::*;

    pub fn submit_vote(ctx: Context<SubmitVote>) -> Result<()> {
        let vote_account = &mut ctx.accounts.vote_account;
        let voter = &mut ctx.accounts.voter;

        vote_account.vote_count += 1;
        voter.has_voted = true;
        Ok(())
    }
    pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        voter.has_voted = false;
        Ok(())
    }
    pub fn create_vote_account(ctx: Context<CreateVoteAccount>) -> Result<()> {
        let vote_account = &mut ctx.accounts.vote_account;
        vote_account.vote_count = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitVote<'info> {
    #[account(mut)]
    pub vote_account: Account<'info, VoteAccount>,
    #[account(mut, signer)]
    pub voter: Account<'info, Voter>,
}

#[derive(Accounts)]
pub struct CreateVoter<'info> {
    #[account(init, payer = user, space = 8 + 1)]
    pub voter: Account<'info, Voter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVoteAccount<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub vote_account: Account<'info, VoteAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VoteAccount {
    pub vote_count: u64,
}

#[account]
pub struct Voter {
    pub has_voted: bool,
}
