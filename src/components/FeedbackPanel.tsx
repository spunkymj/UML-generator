import { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface FeedbackPanelProps {
  onSubmit: (feedback: {
    rating?: number;
    feedbackText?: string;
    feedbackType: 'positive' | 'negative' | 'neutral';
  }) => void;
}

export function FeedbackPanel({ onSubmit }: FeedbackPanelProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      rating: rating > 0 ? rating : undefined,
      feedbackText: feedbackText.trim() || undefined,
      feedbackType
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <ThumbsUp className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-green-800 font-medium">Thank you for your feedback!</p>
        <p className="text-green-600 text-sm mt-1">Your input helps improve our UML generation</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800">Rate this generation</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quality Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Overall Sentiment
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFeedbackType('positive')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                feedbackType === 'positive'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Good
            </button>
            <button
              onClick={() => setFeedbackType('neutral')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                feedbackType === 'neutral'
                  ? 'border-slate-500 bg-slate-50 text-slate-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => setFeedbackType('negative')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                feedbackType === 'negative'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              Poor
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your thoughts on this generation..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
