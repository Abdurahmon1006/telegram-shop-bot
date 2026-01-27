# Database Migrations for Telegram Shop Bot

This directory contains instructions and scripts for managing database migrations for the Telegram Shop Bot project.

## Running Migrations

To run the migrations, ensure you have the necessary database setup and configuration in place. You can use the following command to execute the migrations:

```bash
# Example command to run migrations
npm run migrate
```

## Creating New Migrations

When you need to create a new migration, follow these steps:

1. Create a new migration file in this directory with a descriptive name.
2. Implement the necessary changes in the migration file.
3. Run the migration command to apply the changes to the database.

## Rollback Migrations

If you need to rollback the last migration, you can use the following command:

```bash
# Example command to rollback the last migration
npm run rollback
```

## Notes

- Ensure to backup your database before running migrations.
- Review the migration scripts carefully to avoid data loss.

For more detailed instructions, refer to the documentation of the migration tool you are using.