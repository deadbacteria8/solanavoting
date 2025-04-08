
export default {
    CreateVoteAccount: async (methods, voteAccount) => {
        return await methods
            .createVoteAccount()
            .accounts({
            voteAccount: voteAccount.publicKey,
            })
            .instruction(); 
    },
    SendVote: async (methods, proof_a, proof_b, proof_c, publicInputs, voteAccount) => {

        return await methods
        .submitVote(proof_a, proof_b, proof_c, publicInputs)
        .accounts({
            voteAccount: voteAccount.publicKey,
        })
        .signers()
        .instruction();
    }
}