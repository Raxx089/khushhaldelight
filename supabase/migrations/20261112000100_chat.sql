create unique index if not exists chat_whatsapp_number_uidx
  on public.chat_conversations(whatsapp_number)
  where channel = 'whatsapp';

alter table public.chat_messages add column reply_to_message_id text;
create unique index chat_message_reply_uidx
  on public.chat_messages(reply_to_message_id)
  where reply_to_message_id is not null;

alter table public.notification_logs
  drop constraint notification_logs_channel_check,
  add constraint notification_logs_channel_check
    check (channel in ('email', 'sms', 'whatsapp')),
  drop constraint notification_logs_status_check,
  add constraint notification_logs_status_check
    check (status in ('pending', 'sent', 'failed', 'not_configured', 'skipped'));

alter table public.notification_logs add column event_key text;
create unique index notification_logs_event_key_uidx
  on public.notification_logs(event_key)
  where event_key is not null;
