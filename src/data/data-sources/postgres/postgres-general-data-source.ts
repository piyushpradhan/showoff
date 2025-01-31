import { Channel } from '@/domain/entities/channel';
import { LoginResponseModel, User } from '@/domain/entities/auth';
import { Message } from '@/domain/entities/message';
import { SQLDatabaseWrapper } from 'src/data/interfaces/data-sources/database-wrapper';
import { IGeneralDataSource } from 'src/data/interfaces/data-sources/general-data-source';

export class PGDataSource implements IGeneralDataSource {
  private db: SQLDatabaseWrapper;
  constructor(db: SQLDatabaseWrapper) {
    this.db = db;
  }

  async getAllUsers(): Promise<User[] | null> {
    try {
      const query = "SELECT * from users WHERE uid <> '00000000-0000-0000-0000-000000000000'";
      const result = await this.db.query(query);
      return result.rows.length > 0 ? result.rows[0] : [];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async createOrUpdateUser(name: string, email: string): Promise<User | null> {
    try {
      const existingUser = await this.getUserByEmail(email);

      if (existingUser) {
        const updatedUser = await this.updateUser(existingUser.uid, name, email);
        return updatedUser;
      } else {
        const newUser = await this.createUser(name, email);
        return newUser;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async updateUser(uid: string, name: string, email: string): Promise<User | null> {
    try {
      const query = 'UPDATE users SET name = :name, email = :email WHERE uid = :uid RETURNING *;';
      const result = await this.db.query(query, {
        replacements: {
          uid,
          name,
          email,
        },
      });
      return result.rows.length > 0 ? result.rows[0][0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users where email = :email;';
      const result = await this.db.query(query, {
        replacements: {
          email,
        },
      });

      return result.rows.length > 0 ? result.rows[0][0] : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getUserById(uid: string): Promise<LoginResponseModel | null> {
    try {
      const query = 'SELECT * FROM users WHERE uid = ?;';
      const result = await this.db.query(query, {
        replacements: { uid },
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async createUser(name: string, email: string): Promise<User | null> {
    try {
      const query = 'INSERT INTO users (name, email) VALUES (:name, :email) RETURNING *';
      const result = await this.db.query(query, {
        replacements: {
          name,
          email,
        },
      });
      return result.rows.length > 0 ? result.rows[0][0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async sendMessage(message: Omit<Message, 'id'>): Promise<void> {
    try {
      const query =
        'INSERT INTO messages (sender, channel_id, contents, tagged_message) VALUES (:sender, :channelId, :contents, :taggedMessage);';
      await this.db.query(query, {
        replacements: {
          ...message,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async deleteMessage(channelId: string, sender: string): Promise<void> {
    try {
      const query = 'DELETE FROM messages WHERE sender = :sender AND channel_id = :channelId;';
      await this.db.query(query, {
        replacements: {
          sender,
          channelId,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async getChannelMessages(channelId: string): Promise<Message[] | null> {
    try {
      const query = 'SELECT * from messages WHERE channel_id = :channelId ORDER BY timestamp DESC LIMIT 30;';
      const result = await this.db.query(query, {
        replacements: { channelId },
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async loadMoreMessages(channelId: string, offset: number, limit: number = 100): Promise<Message[] | null> {
    try {
      const query =
        'SELECT * from messages WHERE channel_id = :channelId ORDER BY timestamp DESC OFFSET :offset LIMIT :limit';
      const result = await this.db.query(query, {
        replacements: { channelId, offset, limit },
      });

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getMessageDetails(messageId: string): Promise<Message | null> {
    try {
      const query = 'SELECT * from messages WHERE id = :messageId';
      const result = await this.db.query(query, {
        replacements: { messageId },
      });

      return result.rows.length > 0 ? result.rows[0]?.[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getAllChannels(): Promise<Channel[] | null> {
    try {
      const query = 'SELECT * FROM channels ORDER BY updated_at DESC;';
      const result = await this.db.query(query);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async createChannel(name: string): Promise<Channel[] | null> {
    try {
      const query = 'INSERT INTO channels (name) VALUES (:name) RETURNING *;';
      const result = await this.db.query(query, {
        replacements: {
          name,
        },
      });
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    try {
      const query = 'DELETE FROM channels where id = :channelId';
      await this.db.query(query, {
        replacements: {
          channelId,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }
}
