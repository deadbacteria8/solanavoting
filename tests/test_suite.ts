
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingProgram } from "../target/types/voting_program";
describe("voting_program", () => {
    // Set up the provider and program
    process.env.ANCHOR_PROVIDER_URL = "http://localhost:8899";
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.voting_program as Program<VotingProgram>;

    let voteAccount = anchor.web3.Keypair.generate();
    let voterAccount = anchor.web3.Keypair.generate();

    it("Creates a vote account", async () => {
        try {
            await program.methods
            .createVoteAccount()
            .accounts({
                voteAccount: voteAccount.publicKey,
                user: provider.wallet.publicKey,
                
            })
            .signers([voteAccount])
            .rpc();
            const voteState = await program.account.voteAccount.fetch(voteAccount.publicKey); 
        } catch (err){
            console.log(err);
        }

    });

    it("Creates a voter account", async () => {
        await program.methods
        .createVoter()
        .accounts({
            voter: voterAccount.publicKey,
            user: provider.wallet.publicKey,
        })
        .signers([voterAccount])
        .rpc();

        const voterState = await program.account.voter.fetch(voterAccount.publicKey);
    });

    it("Votes for a candidate", async () => {
        await program.methods
            .submitVote()
            .accounts({
                voteAccount: voteAccount.publicKey,
                voter: voterAccount.publicKey,
            })
            .signers([voterAccount])
            .rpc();
        const voteState = await program.account.voteAccount.fetch(voteAccount.publicKey);
        const voterState = await program.account.voter.fetch(voterAccount.publicKey);
        console.log("Vote count after vote:", voteState);
        console.log("Voter has voted:", voterState);
    });
});
