$ErrorActionPreference = 'Stop'

$seedDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$referencePath = Join-Path $seedDir 'reference.sql'
$outputPath = Join-Path $seedDir 'seed.sql'
$rng = New-Object System.Random 20251002
$invariant = [System.Globalization.CultureInfo]::InvariantCulture

function Format-SeedGuid([string]$prefix, [int]$number) {
    return ('{0}-0000-4000-8000-{1:x12}' -f $prefix, $number)
}

function Format-Money([double]$value) {
    $rounded = [math]::Round($value, 2, [System.MidpointRounding]::AwayFromZero)
    return $rounded.ToString('0.00', $invariant)
}

function Format-Timestamp([datetime]$value) {
    return $value.ToString('yyyy-MM-dd HH:mm:ss', $invariant) + '+00'
}

$teamIds = @(
    'a1111111-0000-4000-8000-000000000001',
    'a1111111-0000-4000-8000-000000000002',
    'a1111111-0000-4000-8000-000000000003',
    'a1111111-0000-4000-8000-000000000004'
)

$positionIds = @(
    'a2222222-0000-4000-8000-000000000001',
    'a2222222-0000-4000-8000-000000000002',
    'a2222222-0000-4000-8000-000000000003',
    'a2222222-0000-4000-8000-000000000004'
)

$categoryBands = @{
    'a3333333-0000-4000-8000-000000000001' = @{ PriceMin = 12.00; PriceMax = 280.00; CostMin = 0.45; CostMax = 0.80 }
    'a3333333-0000-4000-8000-000000000002' = @{ PriceMin = 350.00; PriceMax = 6500.00; CostMin = 0.40; CostMax = 0.72 }
    'a3333333-0000-4000-8000-000000000003' = @{ PriceMin = 9000.00; PriceMax = 125000.00; CostMin = 0.55; CostMax = 0.84 }
    'a3333333-0000-4000-8000-000000000004' = @{ PriceMin = 1800.00; PriceMax = 42000.00; CostMin = 0.32; CostMax = 0.68 }
}

$products = @(
    @{ Id = 'a4444444-0000-4000-8000-000000000001'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 18.00; PriceMax = 65.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000002'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 12.00; PriceMax = 40.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000003'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 160.00; PriceMax = 280.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000004'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 45.00; PriceMax = 190.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000005'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 70.00; PriceMax = 240.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000006'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 15.00; PriceMax = 55.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000007'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 22.00; PriceMax = 85.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000008'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 90.00; PriceMax = 260.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000009'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 25.00; PriceMax = 75.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000010'; CategoryId = 'a3333333-0000-4000-8000-000000000001'; PriceMin = 60.00; PriceMax = 210.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000011'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 350.00; PriceMax = 900.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000012'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 700.00; PriceMax = 2400.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000013'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 900.00; PriceMax = 4200.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000014'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 1200.00; PriceMax = 6500.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000015'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 1500.00; PriceMax = 5800.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000016'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 350.00; PriceMax = 1400.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000017'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 800.00; PriceMax = 3200.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000018'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 1100.00; PriceMax = 4900.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000019'; CategoryId = 'a3333333-0000-4000-8000-000000000002'; PriceMin = 400.00; PriceMax = 1600.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000020'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 42000.00; PriceMax = 78000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000021'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 68000.00; PriceMax = 125000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000022'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 12000.00; PriceMax = 28000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000023'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 18000.00; PriceMax = 46000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000024'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 35000.00; PriceMax = 98000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000025'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 9000.00; PriceMax = 24000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000026'; CategoryId = 'a3333333-0000-4000-8000-000000000003'; PriceMin = 22000.00; PriceMax = 64000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000027'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 7500.00; PriceMax = 28000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000028'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 9000.00; PriceMax = 42000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000029'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 3200.00; PriceMax = 11000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000030'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 14000.00; PriceMax = 36000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000031'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 6000.00; PriceMax = 19000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000032'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 1800.00; PriceMax = 6400.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000033'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 1900.00; PriceMax = 5200.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000034'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 2400.00; PriceMax = 8700.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000035'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 4500.00; PriceMax = 16000.00 },
    @{ Id = 'a4444444-0000-4000-8000-000000000036'; CategoryId = 'a3333333-0000-4000-8000-000000000004'; PriceMin = 2200.00; PriceMax = 7800.00 }
)

$referenceText = [System.IO.File]::ReadAllText($referencePath)
foreach ($id in ($teamIds + $positionIds + @($categoryBands.Keys) + @($products | ForEach-Object { $_.Id }))) {
    if ($referenceText.IndexOf($id) -lt 0) {
        throw "reference.sql does not contain $id"
    }
}

$managerNames = @(
    'Анна Соколова', 'Борис Лебедев', 'Вера Орлова', 'Глеб Морозов', 'Дина Крылова',
    'Егор Панов', 'Жанна Белова', 'Илья Фомин', 'Кира Новикова', 'Лев Савельев',
    'Мария Волкова', 'Никита Егоров', 'Ольга Титова', 'Павел Жуков', 'Рита Макарова',
    'Степан Ильин', 'Татьяна Громова', 'Федор Лапин', 'Юлия Седова', 'Ян Киселев'
)

$customerFirstNames = @(
    'Алексей', 'Марина', 'Сергей', 'Наталья', 'Дмитрий', 'Елена', 'Андрей', 'Ирина',
    'Максим', 'Светлана', 'Роман', 'Оксана', 'Виктор', 'Лариса', 'Артем', 'Полина'
)

$customerLastNames = @(
    'Иванов', 'Петрова', 'Сидоров', 'Кузнецова', 'Смирнов', 'Попова', 'Васильев', 'Соколова',
    'Михайлов', 'Новикова', 'Федоров', 'Морозова', 'Волков', 'Алексеева', 'Лебедев', 'Семенова'
)

$companies = @(
    'Северсталь Снаб', 'Южный Контур', 'Западный Логистик', 'Центр Офис', 'Речной Порт',
    'Полевая Лавка', 'Городской Архив', 'Тихий Двор', 'Бумажный Цех', 'Склад на Набережной',
    'Мастерская Линия', 'Контора Восток', 'Лампа и Стол', 'Первый Этаж', 'Дальняя Полка',
    'Новая Смена', 'Типография Мост', 'Кабинет 12', 'Счетная Палата Региона', 'Отдел Снабжения'
)

$segments = @('Малый бизнес', 'Средний бизнес', 'Корпоративный', 'Государственный')

$managerWeights = @(8, 12, 6, 2, 1, 9, 7, 1, 5, 4, 14, 2, 6, 10, 1, 3, 11, 3, 7, 2)
$monthWeights = @(6, 11, 15, 4, 3, 13, 7, 8, 12, 5, 4, 14)
$periodStart = [datetime]'2025-10-01'
$saleCount = 3000
$managerCount = 20
$customerCount = 80

$emptyMonths = New-Object 'System.Collections.Generic.HashSet[string]'
for ($managerIndex = 0; $managerIndex -lt $managerCount; $managerIndex++) {
    $weight = $managerWeights[$managerIndex]
    $skipCount = 0
    if ($weight -le 2) { $skipCount = 3 }
    elseif ($weight -le 4) { $skipCount = 2 }
    elseif ($weight -le 7) { $skipCount = 1 }

    $pool = New-Object System.Collections.Generic.List[int]
    for ($month = 0; $month -lt 12; $month++) { [void]$pool.Add($month) }
    for ($skip = 0; $skip -lt $skipCount; $skip++) {
        $pick = $rng.Next(0, $pool.Count)
        $month = $pool[$pick]
        $pool.RemoveAt($pick)
        [void]$emptyMonths.Add("$managerIndex-$month")
    }
}

$slots = New-Object System.Collections.Generic.List[object]
for ($managerIndex = 0; $managerIndex -lt $managerCount; $managerIndex++) {
    for ($month = 0; $month -lt 12; $month++) {
        if ($emptyMonths.Contains("$managerIndex-$month")) { continue }
        $copies = $managerWeights[$managerIndex] * $monthWeights[$month]
        for ($copy = 0; $copy -lt $copies; $copy++) {
            $slots.Add(@($managerIndex, $month))
        }
    }
}

function New-SaleDate([int]$managerIndex, [int]$month, $fixedDay) {
    $monthStart = $periodStart.AddMonths($month)
    if ($null -ne $fixedDay) {
        $day = $fixedDay
    }
    else {
        $dayNumber = $rng.Next(1, [datetime]::DaysInMonth($monthStart.Year, $monthStart.Month) + 1)
        $day = Get-Date -Year $monthStart.Year -Month $monthStart.Month -Day $dayNumber -Hour 0 -Minute 0 -Second 0
    }

    $hour = $rng.Next(8, 19)
    $minute = $rng.Next(0, 60)
    $second = $rng.Next(0, 60)
    return Get-Date -Year $day.Year -Month $day.Month -Day $day.Day -Hour $hour -Minute $minute -Second $second
}

function New-LineCount {
    $roll = $rng.Next(0, 100)
    if ($roll -lt 38) { return 1 }
    if ($roll -lt 68) { return 2 }
    if ($roll -lt 86) { return 3 }
    if ($roll -lt 96) { return 4 }
    if ($roll -lt 99) { return 5 }
    return 6
}

$managerRows = New-Object System.Collections.Generic.List[string]
for ($index = 0; $index -lt $managerCount; $index++) {
    $id = Format-SeedGuid 'b1111111' ($index + 1)
    $teamId = $teamIds[$index % $teamIds.Count]
    $positionId = $positionIds[$index % $positionIds.Count]
    $isActive = $index -lt 16
    $activeSql = 'false'
    if ($isActive) { $activeSql = 'true' }
    $avatar = 'https://cdn.example.com/avatars/manager-{0:d2}.png' -f ($index + 1)
    $managerRows.Add(("    ('{0}', '{1}', '{2}', '{3}', {4}, '{5}')" -f $id, $managerNames[$index], $teamId, $positionId, $activeSql, $avatar))
}

$customerRows = New-Object System.Collections.Generic.List[string]
for ($index = 0; $index -lt $customerCount; $index++) {
    $id = Format-SeedGuid 'b2222222' ($index + 1)
    $name = '{0} {1}' -f $customerFirstNames[$index % $customerFirstNames.Count], $customerLastNames[($index * 3) % $customerLastNames.Count]
    $company = '{0} {1}' -f $companies[$index % $companies.Count], ($index + 1)
    $segment = $segments[$index % $segments.Count]
    $customerRows.Add(("    ('{0}', '{1}', '{2}', '{3}')" -f $id, $name, $company, $segment))
}

$saleRows = New-Object System.Collections.Generic.List[string]
$itemRows = New-Object System.Collections.Generic.List[string]
$statusCounts = @(0, 0, 0)
$itemNumber = 1
$occupied = @{}
$firstDay = [datetime]'2025-10-01'
$lastDay = [datetime]'2026-09-30'

for ($saleIndex = 0; $saleIndex -lt $saleCount; $saleIndex++) {
    $fixedDay = $null
    if ($saleIndex -eq 0) {
        $managerIndex = 0
        while ($emptyMonths.Contains("$managerIndex-0")) { $managerIndex++ }
        $month = 0
        $fixedDay = $firstDay
    }
    elseif ($saleIndex -eq ($saleCount - 1)) {
        $managerIndex = 1
        while ($emptyMonths.Contains("$managerIndex-11")) { $managerIndex++ }
        $month = 11
        $fixedDay = $lastDay
    }
    else {
        $slot = $slots[$rng.Next(0, $slots.Count)]
        $managerIndex = $slot[0]
        $month = $slot[1]
    }

    $date = New-SaleDate $managerIndex $month $fixedDay
    $customerIndex = $rng.Next(0, $customerCount)
    $statusRoll = $rng.Next(0, 100)
    $status = 2
    if ($statusRoll -lt 84) { $status = 0 }
    elseif ($statusRoll -lt 95) { $status = 1 }
    $statusCounts[$status]++

    $saleId = Format-SeedGuid 'b3333333' ($saleIndex + 1)
    $managerId = Format-SeedGuid 'b1111111' ($managerIndex + 1)
    $customerId = Format-SeedGuid 'b2222222' ($customerIndex + 1)
    $saleRows.Add(("    ('{0}', '{1}', '{2}', '{3}', {4})" -f $saleId, $managerId, $customerId, (Format-Timestamp $date), $status))

    $monthKey = '{0}-{1:yyyy-MM}' -f $managerIndex, $date
    $occupied[$monthKey] = $true

    $lineCount = New-LineCount
    for ($line = 0; $line -lt $lineCount; $line++) {
        $product = $products[$rng.Next(0, $products.Count)]
        $band = $categoryBands[$product.CategoryId]
        $priceMin = [double]$product.PriceMin
        $priceMax = [double]$product.PriceMax
        $listPrice = $priceMin + ($rng.NextDouble() * ($priceMax - $priceMin))
        $ratio = [double]$band.CostMin + ($rng.NextDouble() * ([double]$band.CostMax - [double]$band.CostMin))
        $costValue = [math]::Round($listPrice * $ratio, 2, [System.MidpointRounding]::AwayFromZero)
        $listRounded = [math]::Round($listPrice, 2, [System.MidpointRounding]::AwayFromZero)
        if ($costValue -ge $listRounded) {
            $costValue = [math]::Round($listRounded - 0.01, 2, [System.MidpointRounding]::AwayFromZero)
        }

        $priceValue = $listRounded
        if ($status -eq 2) {
            $received = 0.20 + ($rng.NextDouble() * 0.60)
            $priceValue = [math]::Round($listRounded * $received, 2, [System.MidpointRounding]::AwayFromZero)
            if ($priceValue -ge $listRounded) {
                $priceValue = [math]::Round($listRounded - 0.01, 2, [System.MidpointRounding]::AwayFromZero)
            }
            if ($priceValue -lt 0.01) { $priceValue = 0.01 }
        }

        $quantity = $rng.Next(1, 6)
        if ($product.CategoryId -eq 'a3333333-0000-4000-8000-000000000001' -and $rng.Next(0, 100) -lt 12) {
            $quantity = $rng.Next(6, 16)
        }

        $itemId = Format-SeedGuid 'b4444444' $itemNumber
        $itemNumber++
        $itemRows.Add(("    ('{0}', '{1}', '{2}', {3}, {4}, {5})" -f $itemId, $saleId, $product.Id, $quantity, (Format-Money $priceValue), (Format-Money $costValue)))
    }
}

$missingEmpty = $true
for ($managerIndex = 0; $managerIndex -lt $managerCount; $managerIndex++) {
    for ($month = 0; $month -lt 12; $month++) {
        $monthStart = $periodStart.AddMonths($month)
        $key = '{0}-{1:yyyy-MM}' -f $managerIndex, $monthStart
        if (-not $occupied.ContainsKey($key)) { $missingEmpty = $false }
    }
}

if ($missingEmpty) { throw 'every manager has a sale in every month' }
if ($statusCounts[0] -le $statusCounts[1] -or $statusCounts[1] -le $statusCounts[2]) {
    throw 'status mix is not Paid > Cancelled > Refunded'
}
if ($saleRows.Count -ne 3000 -or $managerRows.Count -ne 20 -or $customerRows.Count -ne 80) {
    throw 'row counts do not match 20 managers, 80 customers, 3000 sales'
}

$hasFirstDay = $false
$hasLastDay = $false
foreach ($row in $saleRows) {
    if ($row.Contains('2025-10-01 ')) { $hasFirstDay = $true }
    if ($row.Contains('2026-09-30 ')) { $hasLastDay = $true }
}
if (-not $hasFirstDay -or -not $hasLastDay) { throw 'period bounds are missing a sale' }

function Add-Insert([System.Text.StringBuilder]$builder, [string]$table, [string]$columns, $rows) {
    [void]$builder.AppendLine("INSERT INTO $table ($columns) VALUES")
    for ($index = 0; $index -lt $rows.Count; $index++) {
        $suffix = ','
        if ($index -eq ($rows.Count - 1)) { $suffix = ';' }
        [void]$builder.AppendLine($rows[$index] + $suffix)
    }
    [void]$builder.AppendLine()
}

$builder = New-Object System.Text.StringBuilder
[void]$builder.AppendLine($referenceText.TrimEnd())
[void]$builder.AppendLine()
Add-Insert $builder 'managers' '"Id", "Name", "TeamId", "PositionId", "IsActive", "Avatar"' $managerRows
Add-Insert $builder 'customers' '"Id", "Name", "Company", "Segment"' $customerRows
Add-Insert $builder 'sales' '"Id", "ManagerId", "CustomerId", "Date", "Status"' $saleRows
Add-Insert $builder 'sale_items' '"Id", "SaleId", "ProductId", "Quantity", "Price", "Cost"' $itemRows

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outputPath, $builder.ToString(), $utf8)
Write-Output ("managers={0} customers={1} sales={2} items={3} paid={4} cancelled={5} refunded={6}" -f $managerRows.Count, $customerRows.Count, $saleRows.Count, $itemRows.Count, $statusCounts[0], $statusCounts[1], $statusCounts[2])
