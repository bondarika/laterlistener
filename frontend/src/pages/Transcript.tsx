import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { ArrowBack, Edit, Save, Cancel, ContentCopy, Download, Share } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { transcriptStore } from '../stores/transcriptStore';
import { authStore } from '../stores/authStore';
import { useState as useReactState } from 'react';
import { fetchTranscriptResultJson } from '../services/api';
import type { TranscriptResult } from '../types/Transcript';

const Transcript: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('transcript');
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // State for transcript JSON
  const [jsonLoading, setJsonLoading] = useReactState(false);
  const [jsonError, setJsonError] = useReactState<string | null>(null);
  const [jsonData, setJsonData] = useReactState<TranscriptResult | null>(null);

  const loadTranscription = useCallback(async () => {
    if (!id) return;

    try {
      await transcriptStore.loadById(id);
      // После загрузки основной транскрипции, если есть result_url, грузим JSON
      const t = transcriptStore.transcript as any;
      if (t && t.result_url) {
        setJsonLoading(true);
        setJsonError(null);
        try {
          const data = await fetchTranscriptResultJson(t.result_url);
          setJsonData(data);
        } catch (err) {
          setJsonError('Ошибка загрузки содержимого транскрипции');
        } finally {
          setJsonLoading(false);
        }
      } else {
        setJsonData(null);
      }
    } catch (error) {
      console.error('Failed to load transcript:', error);
    }
  }, [id]);

  useEffect(() => {
    loadTranscription();
  }, [id, loadTranscription]);

  useEffect(() => {
    // Проверяем наличие одноразового токена в URL
    const params = new URLSearchParams(window.location.search);
    const oneTimeToken = params.get('auth_token');
    if (oneTimeToken) {
      authStore.exchangeOneTimeTokenForJWT(oneTimeToken).then((success) => {
        if (success) {
          setLoginSuccess(true);
          // Убираем токен из URL
          params.delete('auth_token');
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        }
      });
    }
  }, []);

  const handleEdit = () => {
    if (transcriptStore.transcript) {
      setEditedText(transcriptStore.transcript.text);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!transcriptStore.transcript) return;

    try {
      transcriptStore.editText(editedText);
      await transcriptStore.save();
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
    const textToCopy =
      currentTab === 'transcript'
        ? transcriptStore.transcript?.text || ''
        : transcriptStore.summary || '';
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDownload = async () => {
    if (!transcriptStore.transcript) return;

    try {
      const blob = await transcriptStore.downloadTranscriptFile('txt');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${transcriptStore.transcript.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = () => {
    if (transcriptStore.transcript) {
      navigate(`/share/${transcriptStore.transcript.id}`);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);

    // Load summary when switching to summary tab
    if (newValue === 'summary' && transcriptStore.transcript && !transcriptStore.summary) {
      transcriptStore.fetchSummary();
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (transcriptStore.loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (loginSuccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Успешный вход! Теперь вы можете пользоваться сервисом.
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Перейти к дашборду
        </Button>
      </Container>
    );
  }

  if (transcriptStore.error || !transcriptStore.transcript) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {transcriptStore.error &&
          transcriptStore.error.includes('Request failed with status code 404')
            ? 'Что-то пошло не так'
            : transcriptStore.error || 'Транскрипция не найдена'}
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Вернуться к дашборду
        </Button>
      </Container>
    );
  }

  const transcript = transcriptStore.transcript;

  // Вкладка "Транскрипция": показываем содержимое JSON, если оно есть
  const renderTranscriptContent = () => {
    if (jsonLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (jsonError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {jsonError}
        </Alert>
      );
    }
    if (jsonData) {
      // Новый формат: массив сегментов
      if (
        Array.isArray(jsonData) &&
        jsonData.length > 0 &&
        jsonData[0].start !== undefined &&
        jsonData[0].end !== undefined &&
        jsonData[0].speaker !== undefined &&
        jsonData[0].word !== undefined
      ) {
        return (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
                    Время начала
                  </th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
                    Время конца
                  </th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
                    Спикер
                  </th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
                    Текст
                  </th>
                </tr>
              </thead>
              <tbody>
                {jsonData.map((seg: any, idx: number) => (
                  <tr key={idx}>
                    <td
                      style={{
                        borderBottom: '1px solid #eee',
                        padding: '8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {seg.start.toFixed(2)}
                    </td>
                    <td
                      style={{
                        borderBottom: '1px solid #eee',
                        padding: '8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {seg.end.toFixed(2)}
                    </td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                      {seg.speaker}
                    </td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{seg.word}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        );
      }
      // Старое поведение для text/blocks
      if ((jsonData as any).text) {
        return (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {(jsonData as any).text}
          </Typography>
        );
      }
      if ((jsonData as any).blocks && Array.isArray((jsonData as any).blocks)) {
        return (
          <Box>
            {(jsonData as any).blocks.map((block: any, idx: number) => (
              <Box key={block.id || idx} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {block.speaker ? `${block.speaker}:` : ''}{' '}
                  {block.start != null ? `[${block.start} - ${block.end}]` : ''}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {block.text}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      }
      return <Typography color="text.secondary">Нет данных для отображения</Typography>;
    }
    // Если нет JSON — fallback на старое поведение
    return (
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {transcript.text}
      </Typography>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Назад к дашборду
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Транскрипция #{transcript.id}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label="Завершено" color="success" />
              <Chip label={`Создано: ${formatDate(transcript.created_at)}`} variant="outlined" />
              <Chip label={`Обновлено: ${formatDate(transcript.updated_at)}`} variant="outlined" />
            </Box>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Транскрипция" value="transcript" />
              <Tab label="Саммари" value="summary" />
            </Tabs>
          </Box>

          {/* Header and action buttons */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">
              {currentTab === 'transcript' ? 'Текст транскрипции' : 'Краткое содержание'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentTab === 'transcript' &&
                (isEditing ? (
                  <>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      size="small"
                    >
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
                    <Button
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      variant="outlined"
                      size="small"
                    >
                      Редактировать
                    </Button>
                    <IconButton onClick={handleCopy} size="small">
                      <ContentCopy />
                    </IconButton>
                    <IconButton onClick={handleDownload} size="small">
                      <Download />
                    </IconButton>
                    <IconButton onClick={handleShare} size="small">
                      <Share />
                    </IconButton>
                  </>
                ))}
              {currentTab === 'summary' && (
                <>
                  <IconButton onClick={handleCopy} size="small">
                    <ContentCopy />
                  </IconButton>
                  <IconButton onClick={handleDownload} size="small">
                    <Download />
                  </IconButton>
                  <IconButton onClick={handleShare} size="small">
                    <Share />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Tab content */}
          {currentTab === 'transcript' &&
            (isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={8}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                variant="outlined"
              />
            ) : (
              <Paper sx={{ p: 3, backgroundColor: '#fafafa', minHeight: 200 }}>
                {renderTranscriptContent()}
              </Paper>
            ))}

          {currentTab === 'summary' && (
            <Paper sx={{ p: 3, backgroundColor: '#fafafa', minHeight: 200 }}>
              {transcriptStore.summaryLoading ? (
                <Box
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Генерируем саммари...
                  </Typography>
                </Box>
              ) : transcriptStore.summary ? (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {transcriptStore.summary}
                </Typography>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Саммари еще не сгенерировано
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => transcriptStore.fetchSummary()}
                    sx={{ mt: 2 }}
                  >
                    Сгенерировать саммари
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
});

export default Transcript;
