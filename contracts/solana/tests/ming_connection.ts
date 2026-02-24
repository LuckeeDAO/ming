import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";

describe("ming_connection", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MingConnection as Program;
  const authority = (provider.wallet as anchor.Wallet).publicKey;
  const connection = provider.connection;

  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );
  const [mintAuthorityPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority")],
    program.programId
  );
  const [programDataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [program.programId.toBuffer()],
    anchor.web3.BPF_LOADER_UPGRADEABLE_PROGRAM_ID
  );

  const airdrop = async (pubkey: anchor.web3.PublicKey) => {
    const sig = await connection.requestAirdrop(pubkey, anchor.web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
  };

  const getNextConnectionId = async (): Promise<anchor.BN> => {
    const cfg = (await (program.account as any).programConfig.fetch(configPda)) as any;
    return cfg.nextConnectionId as anchor.BN;
  };

  const mintWithPayer = async (payer: anchor.web3.Keypair, recipient: anchor.web3.Keypair) => {
    const mint = anchor.web3.Keypair.generate();
    const nextId = await getNextConnectionId();
    const idLe = nextId.toArrayLike(Buffer, "le", 8);
    const [connectionRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("connection"), idLe],
      program.programId
    );
    const recipientAta = getAssociatedTokenAddressSync(mint.publicKey, recipient.publicKey);

    await (program.methods as any)
      .mintConnectionNft(
        recipient.publicKey,
        "ipfs://QmMeta",
        "wood_forest",
        "木",
        Array.from(Buffer.alloc(32, 1))
      )
      .accounts({
        payer: payer.publicKey,
        config: configPda,
        mint: mint.publicKey,
        mintAuthority: mintAuthorityPda,
        recipientWallet: recipient.publicKey,
        recipientTokenAccount: recipientAta,
        connectionRecord: connectionRecordPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer, mint])
      .rpc();

    return { mint: mint.publicKey, recipientAta, connectionRecordPda, connectionId: nextId };
  };

  it("rejects initialize by non-upgrade-authority signer", async () => {
    const attacker = anchor.web3.Keypair.generate();
    await airdrop(attacker.publicKey);

    let failed = false;
    try {
      await (program.methods as any)
        .initializeConfig()
        .accounts({
          payer: attacker.publicKey,
          authority: attacker.publicKey,
          program: program.programId,
          programData: programDataAddress,
          config: configPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([attacker])
        .rpc();
    } catch (e) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("initializes config", async () => {
    await (program.methods as any)
      .initializeConfig()
      .accounts({
        payer: authority,
        authority,
        program: program.programId,
        programData: programDataAddress,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const cfg = (await (program.account as any).programConfig.fetch(configPda)) as any;
    expect(cfg.authority.toBase58()).to.eq(authority.toBase58());
    expect(cfg.paused).to.eq(false);
  });

  it("allows non-owner user mint", async () => {
    const user = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    await airdrop(user.publicKey);

    const { recipientAta, mint } = await mintWithPayer(user, recipient);
    const ata = await getAccount(connection, recipientAta);
    expect(Number(ata.amount)).to.eq(1);
    const mintState = await getMint(connection, mint);
    expect(mintState.mintAuthority).to.eq(null);
    expect(mintState.freezeAuthority).to.eq(null);
  });

  it("rejects mint with unsupported token uri scheme", async () => {
    const user = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    await airdrop(user.publicKey);

    const mint = anchor.web3.Keypair.generate();
    const nextId = await getNextConnectionId();
    const idLe = nextId.toArrayLike(Buffer, "le", 8);
    const [connectionRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("connection"), idLe],
      program.programId
    );
    const recipientAta = getAssociatedTokenAddressSync(mint.publicKey, recipient.publicKey);

    let failed = false;
    try {
      await (program.methods as any)
        .mintConnectionNft(
          recipient.publicKey,
          "javascript:alert(1)",
          "wood_forest",
          "木",
          Array.from(Buffer.alloc(32, 1))
        )
        .accounts({
          payer: user.publicKey,
          config: configPda,
          mint: mint.publicKey,
          mintAuthority: mintAuthorityPda,
          recipientWallet: recipient.publicKey,
          recipientTokenAccount: recipientAta,
          connectionRecord: connectionRecordPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user, mint])
        .rpc();
    } catch (e) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("allows owner wallet mint", async () => {
    const ownerAsPayer = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    await airdrop(ownerAsPayer.publicKey);

    const { recipientAta } = await mintWithPayer(ownerAsPayer, recipient);
    const ata = await getAccount(connection, recipientAta);
    expect(Number(ata.amount)).to.eq(1);
  });

  it("allows current holder to release connection", async () => {
    const minter = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    await airdrop(minter.publicKey);
    await airdrop(recipient.publicKey);

    const { connectionId, connectionRecordPda, recipientAta } = await mintWithPayer(minter, recipient);

    await (program.methods as any)
      .releaseConnection(connectionId, "ipfs://QmReleasedMeta")
      .accounts({
        operator: recipient.publicKey,
        connectionRecord: connectionRecordPda,
        holderTokenAccount: recipientAta,
      })
      .signers([recipient])
      .rpc();

    const record = (await (program.account as any).connectionRecord.fetch(connectionRecordPda)) as any;
    expect(record.released).to.eq(true);
    expect(record.tokenUri).to.eq("ipfs://QmReleasedMeta");
    expect(record.releasedAt.toNumber()).to.be.greaterThan(0);
    expect(Buffer.from(record.consensusHash).equals(Buffer.alloc(32, 0))).to.eq(true);
  });

  it("rejects release by non-holder", async () => {
    const minter = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    const attacker = anchor.web3.Keypair.generate();
    await airdrop(minter.publicKey);
    await airdrop(attacker.publicKey);

    const { connectionId, connectionRecordPda, recipientAta } = await mintWithPayer(minter, recipient);

    let failed = false;
    try {
      await (program.methods as any)
        .releaseConnection(connectionId, "ipfs://QmReleasedMeta")
        .accounts({
          operator: attacker.publicKey,
          connectionRecord: connectionRecordPda,
          holderTokenAccount: recipientAta,
        })
        .signers([attacker])
        .rpc();
    } catch (e) {
      failed = true;
    }
    expect(failed).to.eq(true);
  });

  it("blocks mint when paused, and allows after resume", async () => {
    await (program.methods as any)
      .setPause(true)
      .accounts({
        authority,
        config: configPda,
      })
      .rpc();

    const user = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    await airdrop(user.publicKey);

    let failed = false;
    try {
      await mintWithPayer(user, recipient);
    } catch (e) {
      failed = true;
    }
    expect(failed).to.eq(true);

    await (program.methods as any)
      .setPause(false)
      .accounts({
        authority,
        config: configPda,
      })
      .rpc();

    const retry = anchor.web3.Keypair.generate();
    const recipient2 = anchor.web3.Keypair.generate();
    await airdrop(retry.publicKey);
    await mintWithPayer(retry, recipient2);
  });

  it("enforces governance permission on consensus update", async () => {
    const user = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();
    await airdrop(user.publicKey);
    const { connectionId, connectionRecordPda } = await mintWithPayer(user, recipient);

    const nonAuthority = anchor.web3.Keypair.generate();
    await airdrop(nonAuthority.publicKey);

    let unauthorizedFailed = false;
    try {
      await (program.methods as any)
        .updateConsensusHash(connectionId, Array.from(Buffer.alloc(32, 9)))
        .accounts({
          authority: nonAuthority.publicKey,
          config: configPda,
          connectionRecord: connectionRecordPda,
        })
        .signers([nonAuthority])
        .rpc();
    } catch (e) {
      unauthorizedFailed = true;
    }
    expect(unauthorizedFailed).to.eq(true);

    await (program.methods as any)
      .updateConsensusHash(connectionId, Array.from(Buffer.alloc(32, 8)))
      .accounts({
        authority,
        config: configPda,
        connectionRecord: connectionRecordPda,
      })
      .rpc();

    const record = (await (program.account as any).connectionRecord.fetch(connectionRecordPda)) as any;
    expect(Buffer.from(record.consensusHash).equals(Buffer.alloc(32, 8))).to.eq(true);
  });
});
