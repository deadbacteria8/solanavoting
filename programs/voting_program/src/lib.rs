use anchor_lang::prelude::*;

use groth16_solana::groth16::{Groth16Verifyingkey, Groth16Verifier};

mod verifying_key;
use verifying_key::VERIFYINGKEY;
//use ark_bn254;
//use ark_serialize::{CanonicalDeserialize, CanonicalSerialize, Compress, Validate};
//use ark_ff::PrimeField;
//use num_bigint::BigUint;
//use std::ops::Neg;

type G1 = ark_bn254::g1::G1Affine;
declare_id!("4FVgw6wQGrGw5kyGGr6Cc3owzzJpBq4M2KmwV5eYKzbq");
#[program]
pub mod voting_program {
    use super::*;
    pub fn submit_vote(ctx: Context<SubmitVote>, proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        public_inputs: [u8; 32],) -> Result<()> {
        let public_inputs = [public_inputs];
        let mut verifier = Groth16Verifier::new(
            &proof_a,
            &proof_b,
            &proof_c,
            &public_inputs,
            &VERIFYINGKEY,
        ).map_err(|_| ErrorCode::VerificationFailed)?;
        let result = verifier.verify();
        match result {
            Ok(true) => msg!("Verification succeeded"),
            Ok(false) => msg!("Verification failed"),
            Err(e) => msg!("Verification error: {:?}", e),
        }

        Ok(())
    }

    pub fn create_vote_account(ctx: Context<CreateVoteAccount>) -> Result<()> {
        let vote_account = &mut ctx.accounts.vote_account;
        vote_account.vote_count = 0;
        Ok(())
    }
}




#[error_code]
pub enum ErrorCode {
    #[msg("Failed to deserialize proof data.")]
    DeserializationFailed,

    #[msg("Failed to serialize proof data.")]
    SerializationFailed,

    #[msg("Failed to convert proof data.")]
    ConversionFailed,

    #[msg("Proof verification failed.")]
    VerificationFailed,

    #[msg("Proof verification failed 2.")]
    VerificationFailed2,
}

#[derive(Accounts)]
pub struct SubmitVote<'info> {
    #[account(mut)]
    pub vote_account: Account<'info, VoteAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
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
