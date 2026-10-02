using FluentValidation;
using Mapster;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using NLog.Web;
using SalesDashboard.Data;
using SalesDashboard.Exceptions;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Host.UseNLog();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<AppExceptionHandler>();
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
TypeAdapterConfig.GlobalSettings.Scan(typeof(Program).Assembly);
builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, ServiceMapper>();
builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    string xmlPath = Path.Combine(AppContext.BaseDirectory, $"{typeof(Program).Assembly.GetName().Name}.xml");
    options.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseSwagger();
app.UseSwaggerUI();
app.MapHealthChecks("/health");
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

app.Run();
