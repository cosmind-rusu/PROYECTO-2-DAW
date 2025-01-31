// Model: Ahorro.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
   public class Ahorro
   {
       [Key]
       public int Id { get; set; }

       [Required]
       public int UsuarioId { get; set; }

       [Required]
       [StringLength(100)]
       public string Nombre { get; set; } = string.Empty;

       [Required]
       [Column(TypeName = "decimal(10,2)")]
       public decimal MetaAhorro { get; set; }

       [Required]
       [Column(TypeName = "decimal(10,2)")]
       public decimal MontoActual { get; set; }

       public DateTime FechaInicio { get; set; } = DateTime.UtcNow;

       public DateTime? FechaObjetivo { get; set; }

       [StringLength(500)]
       public string? Descripcion { get; set; }

       [ForeignKey("UsuarioId")]
       public Usuario? Usuario { get; set; }
   }
}

// DTOs: AhorroDTO.cs
namespace Backend.DTOs
{
   public class AhorroDTO
   {
       public string Nombre { get; set; } = string.Empty;
       public decimal MetaAhorro { get; set; }
       public decimal MontoActual { get; set; }
       public DateTime? FechaObjetivo { get; set; }
       public string? Descripcion { get; set; }
   }

   public class AhorroRespuestaDTO
   {
       public int Id { get; set; }
       public string Nombre { get; set; } = string.Empty;
       public decimal MetaAhorro { get; set; }
       public decimal MontoActual { get; set; }
       public decimal PorcentajeCompletado { get; set; }
       public DateTime FechaInicio { get; set; }
       public DateTime? FechaObjetivo { get; set; }
       public string? Descripcion { get; set; }
   }
}