use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{
    mint_to, set_authority, Mint, MintTo, SetAuthority, Token, TokenAccount,
};
use anchor_spl::token::spl_token::instruction::AuthorityType;

declare_id!("5Ga3kk79rpPJy5joLvZKoJowRsEGvfcMpSDqAahYEVKT");

const MAX_TOKEN_URI_LEN: usize = 200;
const MAX_EXTERNAL_OBJECT_ID_LEN: usize = 64;
const MAX_ELEMENT_LEN: usize = 16;

#[program]
pub mod ming_connection {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.payer.key(),
            ctx.accounts.authority.key(),
            MingError::Unauthorized
        );
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.paused = false;
        config.next_connection_id = 1;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require_keys_eq!(
            ctx.accounts.authority.key(),
            config.authority,
            MingError::Unauthorized
        );
        config.paused = paused;
        Ok(())
    }

    pub fn mint_connection_nft(
        ctx: Context<MintConnectionNft>,
        recipient: Pubkey,
        token_uri: String,
        external_object_id: String,
        element: String,
        consensus_hash: [u8; 32],
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(!config.paused, MingError::ProgramPaused);
        require_keys_eq!(
            recipient,
            ctx.accounts.recipient_wallet.key(),
            MingError::RecipientMismatch
        );

        validate_mint_fields(&token_uri, &external_object_id, &element)?;

        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];

        // Mint exactly 1 token (NFT semantics with decimals = 0).
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                signer_seeds,
            ),
            1,
        )?;

        // Revoke mint authority to lock supply.
        set_authority(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.mint_authority.to_account_info(),
                    account_or_mint: ctx.accounts.mint.to_account_info(),
                },
                signer_seeds,
            ),
            AuthorityType::MintTokens,
            None,
        )?;

        // Revoke freeze authority as well to avoid any post-mint freeze control.
        set_authority(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.mint_authority.to_account_info(),
                    account_or_mint: ctx.accounts.mint.to_account_info(),
                },
                signer_seeds,
            ),
            AuthorityType::FreezeAccount,
            None,
        )?;

        let connection = &mut ctx.accounts.connection_record;
        let connection_id = config.next_connection_id;
        connection.connection_id = connection_id;
        connection.minter = ctx.accounts.payer.key();
        connection.recipient = recipient;
        connection.mint = ctx.accounts.mint.key();
        connection.token_uri = token_uri;
        connection.external_object_id = external_object_id;
        connection.element = element;
        connection.consensus_hash = consensus_hash;
        connection.created_at = Clock::get()?.unix_timestamp;
        connection.released = false;
        connection.released_at = 0;
        connection.bump = ctx.bumps.connection_record;

        config.next_connection_id = config
            .next_connection_id
            .checked_add(1)
            .ok_or(MingError::MathOverflow)?;

        emit!(ConnectionMintedEvent {
            connection_id,
            minter: connection.minter,
            recipient,
            mint: connection.mint,
            created_at: connection.created_at,
        });

        Ok(())
    }

    pub fn update_consensus_hash(
        ctx: Context<UpdateConsensusHash>,
        _connection_id: u64,
        new_consensus_hash: [u8; 32],
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        require_keys_eq!(
            ctx.accounts.authority.key(),
            config.authority,
            MingError::Unauthorized
        );

        let connection = &mut ctx.accounts.connection_record;
        connection.consensus_hash = new_consensus_hash;

        emit!(ConsensusHashUpdatedEvent {
            connection_id: connection.connection_id,
            operator: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    pub fn release_connection(
        ctx: Context<ReleaseConnection>,
        _connection_id: u64,
        released_token_uri: String,
    ) -> Result<()> {
        validate_release_token_uri(&released_token_uri)?;

        require!(
            ctx.accounts.holder_token_account.amount > 0,
            MingError::NotConnectionHolder
        );

        let connection = &mut ctx.accounts.connection_record;
        require!(!connection.released, MingError::AlreadyReleased);

        connection.token_uri = released_token_uri;
        connection.consensus_hash = [0u8; 32];
        connection.released = true;
        connection.released_at = Clock::get()?.unix_timestamp;

        emit!(ConnectionReleasedEvent {
            connection_id: connection.connection_id,
            operator: ctx.accounts.operator.key(),
            mint: connection.mint,
            released_at: connection.released_at,
        });

        Ok(())
    }
}

fn validate_mint_fields(token_uri: &str, external_object_id: &str, element: &str) -> Result<()> {
    require!(!token_uri.is_empty(), MingError::InvalidTokenUri);
    require!(
        token_uri.starts_with("ipfs://") || token_uri.starts_with("https://"),
        MingError::InvalidTokenUri
    );
    require!(
        token_uri.len() <= MAX_TOKEN_URI_LEN,
        MingError::TokenUriTooLong
    );

    require!(
        !external_object_id.is_empty(),
        MingError::InvalidExternalObjectId
    );
    require!(
        external_object_id.len() <= MAX_EXTERNAL_OBJECT_ID_LEN,
        MingError::ExternalObjectIdTooLong
    );

    require!(!element.is_empty(), MingError::InvalidElement);
    require!(element.len() <= MAX_ELEMENT_LEN, MingError::ElementTooLong);

    Ok(())
}

fn validate_release_token_uri(token_uri: &str) -> Result<()> {
    require!(!token_uri.is_empty(), MingError::InvalidTokenUri);
    require!(
        token_uri.starts_with("ipfs://") || token_uri.starts_with("https://"),
        MingError::InvalidTokenUri
    );
    require!(
        token_uri.len() <= MAX_TOKEN_URI_LEN,
        MingError::TokenUriTooLong
    );
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub authority: Signer<'info>,

    #[account(
        constraint = program.programdata_address()? == Some(program_data.key()) @ MingError::Unauthorized
    )]
    pub program: Program<'info, crate::program::MingConnection>,

    #[account(
        constraint = program_data.upgrade_authority_address == Some(authority.key()) @ MingError::Unauthorized
    )]
    pub program_data: Account<'info, ProgramData>,

    #[account(
        init,
        payer = payer,
        space = 8 + ProgramConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProgramConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProgramConfig>,
}

#[derive(Accounts)]
pub struct MintConnectionNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    /// CHECK: PDA used as mint authority signer only.
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    pub recipient_wallet: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = recipient_wallet
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        space = 8 + ConnectionRecord::INIT_SPACE,
        seeds = [b"connection", &config.next_connection_id.to_le_bytes()],
        bump
    )]
    pub connection_record: Account<'info, ConnectionRecord>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(connection_id: u64)]
pub struct UpdateConsensusHash<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        mut,
        seeds = [b"connection", &connection_id.to_le_bytes()],
        bump = connection_record.bump
    )]
    pub connection_record: Account<'info, ConnectionRecord>,
}

#[account]
#[derive(InitSpace)]
pub struct ProgramConfig {
    pub authority: Pubkey,
    pub paused: bool,
    pub next_connection_id: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ConnectionRecord {
    pub connection_id: u64,
    pub minter: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,

    #[max_len(MAX_TOKEN_URI_LEN)]
    pub token_uri: String,

    #[max_len(MAX_EXTERNAL_OBJECT_ID_LEN)]
    pub external_object_id: String,

    #[max_len(MAX_ELEMENT_LEN)]
    pub element: String,

    pub consensus_hash: [u8; 32],
    pub created_at: i64,
    pub released: bool,
    pub released_at: i64,
    pub bump: u8,
}

#[event]
pub struct ConnectionMintedEvent {
    pub connection_id: u64,
    pub minter: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub created_at: i64,
}

#[event]
pub struct ConsensusHashUpdatedEvent {
    pub connection_id: u64,
    pub operator: Pubkey,
}

#[event]
pub struct ConnectionReleasedEvent {
    pub connection_id: u64,
    pub operator: Pubkey,
    pub mint: Pubkey,
    pub released_at: i64,
}

#[error_code]
pub enum MingError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Invalid token uri")]
    InvalidTokenUri,
    #[msg("Token uri too long")]
    TokenUriTooLong,
    #[msg("Invalid external object id")]
    InvalidExternalObjectId,
    #[msg("External object id too long")]
    ExternalObjectIdTooLong,
    #[msg("Invalid element")]
    InvalidElement,
    #[msg("Element too long")]
    ElementTooLong,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Recipient mismatch")]
    RecipientMismatch,
    #[msg("Connection already released")]
    AlreadyReleased,
    #[msg("Operator is not current connection holder")]
    NotConnectionHolder,
}

#[derive(Accounts)]
#[instruction(connection_id: u64)]
pub struct ReleaseConnection<'info> {
    pub operator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"connection", &connection_id.to_le_bytes()],
        bump = connection_record.bump
    )]
    pub connection_record: Account<'info, ConnectionRecord>,

    #[account(
        constraint = holder_token_account.mint == connection_record.mint @ MingError::NotConnectionHolder,
        constraint = holder_token_account.owner == operator.key() @ MingError::NotConnectionHolder
    )]
    pub holder_token_account: Account<'info, TokenAccount>,
}
