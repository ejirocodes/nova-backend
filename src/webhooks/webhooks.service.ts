import { Injectable, Logger } from '@nestjs/common';
import { UserModel } from 'src/users/models/user.model';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly userModel: UserModel) {}

  async handleClerkUserCreated(userData: any): Promise<void> {
    try {
      this.logger.log(`Processing Clerk user creation webhook: ${userData}`);

      const {
        id: clerkId,
        email_addresses,
        first_name,
        last_name,
        // image_url,
        created_at,
        // last_sign_in_at,
        updated_at,
        // username,
      } = userData.data;

      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === userData.data.primary_email_address_id,
      )?.email_address;

      const existingUser = await this.userModel.findOneByClerkId(clerkId);

      if (existingUser) {
        this.logger.log(
          `User with clerkId ${clerkId} already exists, skipping creation`,
        );
        return;
      }

      await this.userModel.create({
        user_id: clerkId,
        email: primaryEmail,
        name: `${first_name} ${last_name}`,
        createdAt: new Date(created_at),
        updatedAt: new Date(updated_at),
        guessesLost: 0,
        guessesMade: 0,
        guessesPending: 0,
        score: 0,
      });

      this.logger.log(`Successfully created user with clerkId: ${clerkId}`);
    } catch (error) {
      this.logger.error(
        `Error handling Clerk user creation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleClerkUserUpdated(userData: any): Promise<void> {
    try {
      this.logger.log(`Processing Clerk user update webhook: ${userData}`);

      const {
        id: clerkId,
        email_addresses,
        first_name,
        last_name,
        // image_url,
        // last_sign_in_at,
        updated_at,
        // username,
      } = userData.data;

      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === userData.data.primary_email_address_id,
      )?.email_address;

      const existingUser = await this.userModel.findOneByClerkId(clerkId);

      if (!existingUser) {
        this.logger.log(
          `User with clerkId ${clerkId} not found, skipping update`,
        );
        return;
      }

      await this.userModel.update(existingUser.user_id, {
        email: primaryEmail,
        name: `${first_name} ${last_name}`,
        updatedAt: new Date(updated_at),
      });

      this.logger.log(`Successfully updated user with clerkId: ${clerkId}`);
    } catch (error) {
      this.logger.error(
        `Error handling Clerk user update: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
