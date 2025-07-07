import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  Divider,
  Paper,
} from '@mui/material';
import { ContentCopy, Download, Edit, Save, Cancel } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { transcriptStore } from '../../stores/transcriptStore';
import type { Transcript } from '../../types/Transcript';

interface TranscriptionDisplayProps {
  transcript: Transcript;
  onEdit?: (text: string) => void;
  onSave?: () => void;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = observer(
  ({ transcript, onEdit }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedText, setEditedText] = useState<string>('');

    const handleEdit = () => {
      setEditedText(transcript.text);
      setIsEditing(true);
    };

    const handleSave = async () => {
      try {
        if (onEdit) {
          onEdit(editedText);
        } else {
          transcriptStore.editText(editedText);
          await transcriptStore.save();
        }
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to save transcript:', error);
      }
    };

    const handleCancel = () => {
      setIsEditing(false);
      setEditedText('');
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(transcript.text);
    };

    const handleDownload = async () => {
      try {
        const blob = await transcriptStore.downloadTranscriptFile('txt');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${transcript.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
      }
    };

    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleString('ru-RU');
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">Результат транскрибуции</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Завершено" color="success" size="small" />
              <Chip label={`ID: ${transcript.id}`} color="primary" size="small" />
            </Box>
          </Box>

          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Транскрипция #{transcript.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(transcript.created_at)}
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ mb: 2 }}>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ) : (
              <Paper sx={{ p: 2, backgroundColor: '#fafafa', minHeight: 100 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {transcript.text}
                </Typography>
              </Paper>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {isEditing ? (
              <>
                <Button startIcon={<Save />} onClick={handleSave} variant="contained" size="small">
                  Сохранить
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  variant="outlined"
                  size="small"
                >
                  Отмена
                </Button>
              </>
            ) : (
              <>
                <Button startIcon={<Edit />} onClick={handleEdit} variant="outlined" size="small">
                  Редактировать
                </Button>
                <Button
                  startIcon={<ContentCopy />}
                  onClick={handleCopy}
                  variant="outlined"
                  size="small"
                >
                  Копировать
                </Button>
                <Button
                  startIcon={<Download />}
                  onClick={handleDownload}
                  variant="outlined"
                  size="small"
                >
                  Скачать
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  },
);

export default TranscriptionDisplay;
