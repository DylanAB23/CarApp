import React, { useState } from 'react';
import { X, Plus, MessageSquare } from 'lucide-react';
import { Sale, SaleNote } from '../../types';

interface NotesModalProps {
  sale: Sale;
  notes: SaleNote[];
  onAddNote: (content: string) => void;
  onClose: () => void;
}

export default function NotesModal({ sale, notes, onAddNote, onClose }: NotesModalProps) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    onAddNote(newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sale Notes</h2>
              <p className="text-sm text-gray-600">
                Add and view notes for this sale
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your note here..."
              className="flex-1 min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Note
            </button>
          </div>
        </form>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No notes have been added yet
            </p>
          ) : (
            notes
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <p className="whitespace-pre-wrap mb-2">{note.content}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{note.createdBy}</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}