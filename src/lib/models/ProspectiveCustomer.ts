import mongoose, { Schema } from 'mongoose';

export interface IProspectiveCustomer {
  userId: string;
  description: string;
  parentId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProspectiveCustomerSchema = new Schema<IProspectiveCustomer>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ProspectiveCustomer = mongoose.models.ProspectiveCustomer ||
  mongoose.model('ProspectiveCustomer', ProspectiveCustomerSchema);

export default ProspectiveCustomer;
