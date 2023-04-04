import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table
export class BaseModel<T> extends Model<T> {
  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: string;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: string;

  @DeletedAt
  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt: string;
}
