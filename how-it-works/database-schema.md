SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;







| table_name    | column_name  | data_type                | is_nullable |
| ------------- | ------------ | ------------------------ | ----------- |
| blog_comments | id           | bigint                   | NO          |
| blog_comments | post_id      | bigint                   | YES         |
| blog_comments | author_name  | text                     | NO          |
| blog_comments | author_email | text                     | NO          |
| blog_comments | content      | text                     | NO          |
| blog_comments | approved     | boolean                  | YES         |
| blog_comments | created_at   | timestamp with time zone | YES         |
| blog_comments | user_id      | uuid                     | YES         |
| blog_posts    | id           | bigint                   | NO          |
| blog_posts    | title        | text                     | NO          |
| blog_posts    | content      | text                     | NO          |
| blog_posts    | excerpt      | text                     | YES         |
| blog_posts    | category     | text                     | YES         |
| blog_posts    | published    | boolean                  | YES         |
| blog_posts    | created_at   | timestamp with time zone | YES         |
| blog_posts    | updated_at   | timestamp with time zone | YES         |
| blog_posts    | author       | text                     | YES         |
| reviews       | id           | bigint                   | NO          |
| reviews       | name         | text                     | NO          |
| reviews       | email        | text                     | NO          |
| reviews       | rating       | integer                  | YES         |
| reviews       | title        | text                     | YES         |
| reviews       | content      | text                     | NO          |
| reviews       | approved     | boolean                  | YES         |
| reviews       | featured     | boolean                  | YES         |
| reviews       | created_at   | timestamp with time zone | YES         |
| reviews       | user_id      | uuid                     | YES         |
| subscribers   | id           | bigint                   | NO          |
| subscribers   | email        | text                     | NO          |
| subscribers   | name         | text                     | YES         |
| subscribers   | source       | text                     | YES         |
| subscribers   | date_added   | timestamp with time zone | YES         |
| subscribers   | active       | boolean                  | YES         |
| subscribers   | user_id      | uuid                     | YES         |
| user_content  | content_type | text                     | YES         |
| user_content  | id           | bigint                   | YES         |
| user_content  | post_id      | bigint                   | YES         |
| user_content  | content      | text                     | YES         |
| user_content  | approved     | boolean                  | YES         |
| user_content  | created_at   | timestamp with time zone | YES         |
| user_content  | user_id      | uuid                     | YES         |