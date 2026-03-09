import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthController } from './app.controller';

@Module({
  imports: [UserModule, AuthModule, TransactionsModule, CategoriesModule],
  controllers: [AuthController],
})
export class AppModule {}
