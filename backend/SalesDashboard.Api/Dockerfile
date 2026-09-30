# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY SalesDashboard.Api/SalesDashboard.Api.csproj SalesDashboard.Api/
RUN dotnet restore SalesDashboard.Api/SalesDashboard.Api.csproj

COPY SalesDashboard.Api/ SalesDashboard.Api/
RUN dotnet publish SalesDashboard.Api/SalesDashboard.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "SalesDashboard.Api.dll"]
