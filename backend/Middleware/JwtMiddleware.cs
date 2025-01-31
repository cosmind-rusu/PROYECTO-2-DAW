using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Backend.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtMiddleware> _logger;

        public JwtMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<JwtMiddleware> logger)
        {
            _next = next;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            _logger.LogInformation($"Token recibido en middleware: {token}");

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    AttachUserToContext(context, token);
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error procesando token: {ex.Message}");
                }
            }
            else
            {
                _logger.LogWarning("No se recibió token en el middleware");
            }

            await _next(context);
        }

private void AttachUserToContext(HttpContext context, string token)
{
    try
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
        var jwtToken = (JwtSecurityToken)validatedToken;

        // 🔍 Ver todos los claims en los logs
        foreach (var claim in jwtToken.Claims)
        {
            _logger.LogInformation($"Claim encontrado: {claim.Type} = {claim.Value}");
        }

        // 📌 Buscar UserId en el claim correcto (http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier)
        var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

        if (userIdClaim == null)
        {
            _logger.LogError("No se encontró un claim válido para UserId en el token.");
            return;
        }

        if (!int.TryParse(userIdClaim.Value, out int userId))
        {
            _logger.LogError($"No se pudo convertir el claim UserId '{userIdClaim.Value}' a un entero.");
            return;
        }

        _logger.LogInformation($"UserId extraído: {userId}");

        context.Items["UserId"] = userId;
        _logger.LogInformation("UserId adjuntado al contexto correctamente.");
    }
    catch (Exception ex)
    {
        _logger.LogError($"Error al procesar el token: {ex.Message}");
    }
}

    }
}
