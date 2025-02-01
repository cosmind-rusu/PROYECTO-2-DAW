using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs.Ahorros;

namespace Backend.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class AhorroController : ControllerBase
   {
       private readonly ApplicationDbContext _context;
       private readonly ILogger<AhorroController> _logger;

       public AhorroController(ApplicationDbContext context, ILogger<AhorroController> logger)
       {
           _context = context;
           _logger = logger;
       }

       [HttpGet]
       public async Task<ActionResult<IEnumerable<ObtenerAhorroDTO>>> GetAhorros()
       {
           try
           {
               var userId = GetUserId();
               var ahorros = await _context.Ahorros
                   .Where(a => a.UsuarioId == userId)
                   .Select(a => new ObtenerAhorroDTO
                   {
                       Id = a.Id,
                       Nombre = a.Nombre,
                       MetaAhorro = a.MetaAhorro,
                       MontoActual = a.MontoActual,
                       PorcentajeCompletado = (a.MontoActual / a.MetaAhorro) * 100,
                       FechaInicio = a.FechaInicio,
                       FechaObjetivo = a.FechaObjetivo,
                       Descripcion = a.Descripcion
                   })
                   .ToListAsync();

               return Ok(ahorros);
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "Error al obtener ahorros para el usuario {UserId}", GetUserId());
               return StatusCode(500, new { message = "Error interno al obtener los ahorros" });
           }
       }

       [HttpPost]
       public async Task<ActionResult<Ahorro>> CreateAhorro(CrearAhorroDTO ahorroDto)
       {
           try
           {
               var ahorro = new Ahorro
               {
                   UsuarioId = GetUserId(),
                   Nombre = ahorroDto.Nombre,
                   MetaAhorro = ahorroDto.MetaAhorro,
                   MontoActual = ahorroDto.MontoActual,
                   FechaInicio = DateTime.UtcNow,
                   FechaObjetivo = ahorroDto.FechaObjetivo,
                   Descripcion = ahorroDto.Descripcion
               };

               _context.Ahorros.Add(ahorro);
               await _context.SaveChangesAsync();

               return CreatedAtAction(nameof(GetAhorro), new { id = ahorro.Id }, ahorro);
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "Error al crear ahorro para el usuario {UserId}", GetUserId());
               return StatusCode(500, new { message = "Error interno al crear el ahorro" });
           }
       }

       [HttpGet("{id}")]
       public async Task<ActionResult<ObtenerAhorroDTO>> GetAhorro(int id)
       {
           try
           {
               var ahorro = await _context.Ahorros
                   .Where(a => a.Id == id && a.UsuarioId == GetUserId())
                   .Select(a => new ObtenerAhorroDTO
                   {
                       Id = a.Id,
                       Nombre = a.Nombre,
                       MetaAhorro = a.MetaAhorro,
                       MontoActual = a.MontoActual,
                       PorcentajeCompletado = (a.MontoActual / a.MetaAhorro) * 100,
                       FechaInicio = a.FechaInicio,
                       FechaObjetivo = a.FechaObjetivo,
                       Descripcion = a.Descripcion
                   })
                   .FirstOrDefaultAsync();

               if (ahorro == null)
                   return NotFound(new { message = "Ahorro no encontrado" });

               return Ok(ahorro);
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "Error al obtener ahorro {Id} del usuario {UserId}", id, GetUserId());
               return StatusCode(500, new { message = "Error interno al obtener el ahorro" });
           }
       }

       [HttpPut("{id}")]
       public async Task<IActionResult> UpdateAhorro(int id, CrearAhorroDTO ahorroDto)
       {
           try
           {
               var ahorro = await _context.Ahorros
                   .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == GetUserId());

               if (ahorro == null)
                   return NotFound(new { message = "Ahorro no encontrado" });

               ahorro.Nombre = ahorroDto.Nombre;
               ahorro.MetaAhorro = ahorroDto.MetaAhorro;
               ahorro.MontoActual = ahorroDto.MontoActual;
               ahorro.FechaObjetivo = ahorroDto.FechaObjetivo;
               ahorro.Descripcion = ahorroDto.Descripcion;

               await _context.SaveChangesAsync();
               return Ok(ahorro);
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "Error al actualizar ahorro {Id} del usuario {UserId}", id, GetUserId());
               return StatusCode(500, new { message = "Error interno al actualizar el ahorro" });
           }
       }

       [HttpDelete("{id}")]
       public async Task<IActionResult> DeleteAhorro(int id)
       {
           try
           {
               var ahorro = await _context.Ahorros
                   .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == GetUserId());

               if (ahorro == null)
                   return NotFound(new { message = "Ahorro no encontrado" });

               _context.Ahorros.Remove(ahorro);
               await _context.SaveChangesAsync();

               return Ok(new { message = "Ahorro eliminado correctamente" });
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "Error al eliminar ahorro {Id} del usuario {UserId}", id, GetUserId());
               return StatusCode(500, new { message = "Error interno al eliminar el ahorro" });
           }
       }

       private int GetUserId()
       {
           return (int)HttpContext.Items["UserId"]!;
       }
   }
}