/* SISTEMA PARA MANEJAR EL REGISTRO */
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<Usuario>> Register(RegistroUsuarioDTO registroDto)
        {
            // Validar los datos del DTO antes de procesar
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // Validar los datos del DTO antes de procesar

            if (await _context.Usuarios.AnyAsync(u => u.Email == registroDto.Email))
            {
                return BadRequest("El email ya está registrado");
            }

            // Hash de la contraseña
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registroDto.Password);

            var usuario = new Usuario
            {
                Nombre = registroDto.Nombre,
                Email = registroDto.Email,
                Password = passwordHash,
                FechaRegistro = DateTime.UtcNow,
                EstadoActivo = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = GenerateToken(usuario);

            return Ok(new
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Token = token
            });
        }

        private string GenerateToken(Usuario usuario)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nombre),
                new Claim(ClaimTypes.Email, usuario.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("Jwt:Key").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var securityToken = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            string token = new JwtSecurityTokenHandler().WriteToken(securityToken);

            return token;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UsuarioRespuestaDTO>> Login(LoginDTO loginDto)
        {

            // Validar los datos del DTO antes de procesar
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // Validar los datos del DTO antes de procesar

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (usuario == null)
                return Unauthorized("Usuario o contraseña incorrectos");

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.Password))
                return Unauthorized("Usuario o contraseña incorrectos");

            var token = GenerateToken(usuario);

            return new UsuarioRespuestaDTO
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Token = token
            };
        }
    }
}