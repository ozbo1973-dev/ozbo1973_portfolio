import mongoose, { Schema } from 'mongoose';

export interface IProspectiveCustomer {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProspectiveCustomerSchema = new Schema<IProspectiveCustomer>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
  },
  {
    timestamps: true, // This enables automatic createdAt and updatedAt fields
  }
);

const ProspectiveCustomer = mongoose.models.ProspectiveCustomer || 
  mongoose.model('ProspectiveCustomer', ProspectiveCustomerSchema);

export default ProspectiveCustomer;
