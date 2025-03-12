import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Budget amount must be positive'],
  },
  month: {
    type: Date,
    required: [true, 'Month is required'],
  }
}, {
  timestamps: true,
});

// Compound index to ensure unique category per month
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);