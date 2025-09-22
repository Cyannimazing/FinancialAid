FIRST TO DO:

git clone https://github.com/Cyannimazing/FinancialAid FinancialAid

cd FinancialAid

code .

BACKEND SETUP

cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

if error

php artisan migrate:fresh --seed

php artisan serve

ANOTHER TERMINAL
SEPARATE TO THE BACKEND

FRONTEND SETUP

cd frontend

npm install

cp .env.example .env

npm run dev

ADMIN USER:

'email' => 'admin@example.com'
'password' => 'admin123'
